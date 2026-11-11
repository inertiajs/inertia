import { get, toPath } from 'es-toolkit/compat'
import { router } from '.'
import { eventHandler } from './eventHandler'
import { fireLiveEvent } from './events'
import { layerAt, layersOf } from './layers'
import { liveChannelKey } from './liveChannel'
import { setPathPreservingIdentity } from './objectUtils'
import { page as currentPage } from './page'
import { propRefreshes } from './propRefreshes'
import { socketId } from './socketId'
import {
  AnyLiveTransport,
  LiveChannel,
  LiveChannelTransport,
  LiveEnvelope,
  LiveOption,
  LiveOptions,
  LiveProp,
  LiveTransport,
  Page,
  Tier,
} from './types'
import { visibility } from './visibility'

const DEFAULT_THROTTLE = 1000

/**
 * How long to keep gathering props before sending the first request of a burst.
 * Long enough for the frames of one server action, which arrive as separate
 * tasks a few milliseconds apart, and short enough to go unnoticed.
 */
const COLLECT_WINDOW = 32

/**
 * Zero the moment the throttle window has elapsed, and zero for a prop that has
 * never been flushed.
 */
export const throttleWait = (throttle: number, flushedAt: number | undefined, now: number): number => {
  return Math.max(0, throttle - (now - (flushedAt ?? -Infinity)))
}

/**
 * A live prop of one tier: a layer, or the page beneath the stack when it names
 * none. Two tiers may declare a prop of the same name, and each keeps its own.
 */
type LivePropRef = {
  layerId: string | undefined
  prop: string
  entry: LiveProp
}

const propKey = (layerId: string | undefined, prop: string): string => `${layerId ?? ''}::${prop}`

/**
 * Keyed by `subscriptionKey`, which is what the transport is asked to subscribe
 * to. The props are held by their `propKey`.
 */
type Subscription = {
  channel: LiveChannel
  event: string
  props: Set<string>
}

const subscriptionKey = (channel: LiveChannel, event: string): string => `${liveChannelKey(channel)}::${event}`

/**
 * Compared the way `pendingDeferredProps` compares its own, since a partial
 * reload replaces the page object without changing which page it is.
 */
const tierKey = (tier: Tier): string => `${tier.component}::${tier.url}`

const tiersOf = (page: Page): [string | undefined, Tier][] => [
  [undefined, page],
  ...layersOf(page).map((layer): [string, Tier] => [layer.id, layer]),
]

const groupByTier = <T extends { layerId: string | undefined }>(refs: T[]): Map<string | undefined, T[]> => {
  const tiers = new Map<string | undefined, T[]>()

  refs.forEach((ref) => tiers.set(ref.layerId, [...(tiers.get(ref.layerId) ?? []), ref]))

  return tiers
}

const isTransport = (live: LiveOption): live is AnyLiveTransport => {
  return (
    typeof (live as LiveTransport).subscribe === 'function' ||
    typeof (live as LiveChannelTransport).subscribeToChannel === 'function'
  )
}

const isChannelTransport = (transport: AnyLiveTransport): transport is LiveChannelTransport => {
  return typeof (transport as LiveChannelTransport).subscribeToChannel === 'function'
}

const envelope = (payload: unknown): LiveEnvelope['__inertia'] =>
  (payload as LiveEnvelope | null | undefined)?.__inertia

/**
 * Keyed by prop dot path. A payload that carries none, or that isn't an object
 * at all, reads as an empty set, which leaves every prop of the subscription to
 * reload as it always has.
 */
const propValues = (payload: unknown): Record<string, unknown> => {
  const props = envelope(payload)?.props

  return props && typeof props === 'object' ? props : {}
}

/**
 * The event name a channel transport's message carries, unless the transport
 * reads it from somewhere of its own.
 */
const liveEventName = (payload: unknown): string | undefined => envelope(payload)?.event

/**
 * Every page swap diffs the live props of the page and its layers against the
 * active subscriptions, and an incoming event marks the props it feeds for
 * reload in one throttled partial request per tier.
 */
class Live {
  protected transport: AnyLiveTransport | null = null
  protected throttle = DEFAULT_THROTTLE
  protected pauseWhenHidden = true
  protected liveProps = new Map<string, LivePropRef>()
  protected subscriptions = new Map<string, Subscription>()
  protected unsubscribers = new Map<string, VoidFunction>()
  protected dirty = new Set<string>()
  protected flushedAt = new Map<string, number>()
  protected pending: { at: number; timeoutId: number } | null = null
  protected incoming = new Map<string, unknown>()
  protected incomingTiers = new Map<string | undefined, string>()
  protected pendingWrite: number | null = null

  /**
   * A second configure is ignored because existing listeners and subscriptions
   * have no disposal path for swapping transports.
   */
  public configure(live: LiveOption): void {
    if (typeof window === 'undefined' || this.transport) {
      return
    }

    const options: LiveOptions = isTransport(live) ? { transport: live } : live

    this.transport = options.transport
    this.throttle = options.throttle ?? DEFAULT_THROTTLE
    this.pauseWhenHidden = options.pauseWhenHidden ?? true

    // A default only, so a resolver the app chose itself is left alone. Bound,
    // since a transport written as a class reads its connection off `this`.
    if (this.transport.socketId) {
      socketId.resolveUsingDefault(this.transport.socketId.bind(this.transport))
    }

    eventHandler.on('pageUpdated', (page: Page) => this.sync(page))

    propRefreshes.onChange(() => this.scheduleFlush())

    visibility.onChange((hidden) => {
      if (!hidden) {
        this.scheduleFlush()
      }
    })

    let wasConnected = false
    let hasConnected = false

    this.transport.onStatusChange?.((connected) => {
      const reconnected = connected && !wasConnected && hasConnected

      wasConnected = connected
      hasConnected ||= connected

      if (reconnected) {
        // Events that fired while the connection was down never arrived, so
        // every live prop is potentially stale
        this.liveProps.forEach((ref, key) => {
          if (this.isRequested(ref)) {
            this.markDirty(key, { force: true })
          }
        })
        this.scheduleFlush()
      }
    })

    if (currentPage.get()) {
      this.sync(currentPage.get())
    }
  }

  /**
   * A hidden tab is not worth a request, while a value a broadcast already
   * delivered is free to apply either way.
   */
  protected isPaused(): boolean {
    return this.pauseWhenHidden && visibility.isHidden()
  }

  protected sync(page: Page): void {
    const transport = this.transport

    if (!transport) {
      return
    }

    const tiers = tiersOf(page)

    this.liveProps = new Map()

    tiers.forEach(([layerId, tier]) => {
      Object.entries(tier.liveProps ?? {}).forEach(([prop, entry]) => {
        this.liveProps.set(propKey(layerId, prop), { layerId, prop, entry })
      })
    })

    const desired = new Map<string, Subscription>()

    this.liveProps.forEach(({ entry }, prop) => {
      entry.listeners.forEach(({ channel, events }) => {
        events.forEach((event) => {
          const key = subscriptionKey(channel, event)
          const existing = desired.get(key)

          if (existing) {
            existing.props.add(prop)
          } else {
            desired.set(key, { channel, event, props: new Set([prop]) })
          }
        })
      })
    })

    // Replace the index before touching the transport, so an event delivered
    // synchronously from `subscribe()` already resolves to its subscription
    this.subscriptions = desired

    const wanted = this.pendingSubscriptions(transport, desired)

    // Subscribe before unsubscribing so refcounted transports keep shared
    // channels alive while the event set changes.
    wanted.forEach((subscribe, key) => {
      if (this.unsubscribers.has(key)) {
        return
      }

      this.unsubscribers.set(key, subscribe())
    })

    this.unsubscribers.forEach((unsubscribe, key) => {
      if (!wanted.has(key)) {
        unsubscribe()
        this.unsubscribers.delete(key)
      }
    })

    this.dirty.forEach((prop) => {
      if (!this.liveProps.has(prop)) {
        this.dirty.delete(prop)
      }
    })

    // Values are collected for the tier they arrived on. A swap of that tier
    // leaves them meaningless, even where the new one happens to declare the
    // same prop, so they go rather than land on data they never described.
    // Throttle windows go with them, since the new tier owes nothing for the old one.
    const swapped = new Set(
      tiers.filter(([layerId, tier]) => this.incomingTiers.get(layerId) !== tierKey(tier)).map(([layerId]) => layerId),
    )

    this.incomingTiers = new Map(tiers.map(([layerId, tier]) => [layerId, tierKey(tier)]))

    this.liveProps.forEach(({ layerId }, prop) => {
      if (swapped.has(layerId)) {
        this.incoming.delete(prop)
        this.flushedAt.delete(prop)
      }
    })

    for (const stale of [this.incoming, this.flushedAt]) {
      stale.forEach((_value, prop) => {
        if (!this.liveProps.has(prop)) {
          stale.delete(prop)
        }
      })
    }
  }

  /**
   * Keyed by what the transport holds: one entry per channel for a channel
   * transport, which cannot route events of its own, and one per channel and
   * event for a transport that can.
   */
  protected pendingSubscriptions(
    transport: AnyLiveTransport,
    desired: Map<string, Subscription>,
  ): Map<string, () => VoidFunction> {
    const pending = new Map<string, () => VoidFunction>()

    if (isChannelTransport(transport)) {
      desired.forEach(({ channel }) => {
        pending.set(liveChannelKey(channel), () => this.subscribeToChannel(transport, channel))
      })

      return pending
    }

    desired.forEach(({ channel, event }, key) => {
      pending.set(key, () => transport.subscribe(channel, event, (payload) => this.handleEvent(key, payload)))
    })

    return pending
  }

  protected subscribeToChannel(transport: LiveChannelTransport, channel: LiveChannel): VoidFunction {
    const readEvent = transport.eventName?.bind(transport) ?? liveEventName

    return transport.subscribeToChannel(channel, (payload) => {
      const event = readEvent(payload)

      if (event === undefined) {
        return
      }

      // Routed back through the same index an event transport resolves
      // against, so the props a subscription feeds stay its own
      this.handleEvent(subscriptionKey(channel, event), payload)
    })
  }

  protected handleEvent(key: string, payload: unknown): void {
    const subscription = this.subscriptions.get(key)

    if (!subscription) {
      return
    }

    // A broadcaster that cannot exclude a connection says which one caused the
    // event instead, so the client that caused it drops its own
    const origin = envelope(payload)?.socketId

    if (typeof origin === 'string' && origin === socketId.resolve()) {
      return
    }

    const fed = Array.from(subscription.props)
      .map((prop) => this.liveProps.get(prop))
      .filter((ref): ref is LivePropRef => ref !== undefined && this.isRequested(ref))

    groupByTier(fed).forEach((refs, layerId) => this.receive(subscription, refs, layerId, payload))
  }

  /**
   * An event that feeds several tiers is announced once for each, so cancelling
   * it for a layer leaves the page beneath it to its own decision.
   */
  protected receive(
    subscription: Subscription,
    refs: LivePropRef[],
    layerId: string | undefined,
    payload: unknown,
  ): void {
    const cancelled = !fireLiveEvent({
      props: refs.map((ref) => ref.prop),
      channel: subscription.channel,
      event: subscription.event,
      payload,
      ...(layerId !== undefined && { layerId }),
    })

    if (cancelled) {
      return
    }

    // The manifest is the whitelist. Only the props this subscription feeds can
    // be written, so a payload can never reach a prop the event has no say over.
    const values = propValues(payload)
    let received = false

    refs.forEach(({ prop }) => {
      const key = propKey(layerId, prop)

      // A request already claims this prop and read the database after the
      // broadcast did, so let the reload win and drop the value.
      const usable = prop in values && !propRefreshes.isRefreshing(prop, layerId)

      if (usable) {
        // A value supersedes a reload this prop was still queued for
        this.dirty.delete(key)
        this.incoming.set(key, values[prop])
        received = true

        return
      }

      this.incoming.delete(key)
      this.markDirty(key)
    })

    this.scheduleFlush()

    if (received) {
      this.scheduleWrite()
    }
  }

  /**
   * A prop its tier has, or a request is still fetching, such as a deferred
   * prop on its way. An optional prop nobody asked for stays out of the tier,
   * even though the server sends its listeners along.
   */
  protected isRequested({ layerId, prop }: LivePropRef): boolean {
    const page = currentPage.get()
    const tier = layerId === undefined ? page : layerAt(page, layerId)

    return tier !== undefined && (get(tier.props, prop) !== undefined || propRefreshes.isRefreshing(prop, layerId))
  }

  /**
   * Every write replaces the history entry, and one per event trips the
   * browser's rate limit, so a burst of events becomes a single write.
   */
  protected scheduleWrite(): void {
    if (this.pendingWrite !== null || typeof window === 'undefined') {
      return
    }

    this.pendingWrite = window.setTimeout(() => {
      this.pendingWrite = null
      this.write()
    }, COLLECT_WINDOW)
  }

  protected write(): void {
    // `sync()` prunes values whose prop left the manifest, so a burst can be
    // emptied out before it ever gets written
    const values = Array.from(this.incoming.entries()).flatMap(([key, value]) => {
      const ref = this.liveProps.get(key)

      return ref ? [{ ...ref, value }] : []
    })

    this.incoming.clear()

    groupByTier(values).forEach((written, layerId) => {
      // Ancestors first. `setPathPreservingIdentity` rebuilds every container
      // along the path, so writing `order` after `order.total` would rebuild
      // `order` from the payload and lose the narrower write.
      written.sort((a, b) => toPath(a.prop).length - toPath(b.prop).length)

      router.replace({
        preserveScroll: true,
        preserveState: true,
        preserveFlash: true,
        ...(layerId !== undefined && { layerId }),
        props: (props) =>
          written.reduce((carry, { prop, value }) => setPathPreservingIdentity(carry, prop, value), props),
      })
    })
  }

  /**
   * Forcing a prop clears the throttle debt it owes, and nothing else. It stays
   * that prop's business, so forcing one never lets another skip its throttle.
   */
  protected markDirty(prop: string, { force = false }: { force?: boolean } = {}): void {
    this.dirty.add(prop)

    if (force) {
      this.flushedAt.delete(prop)
    }
  }

  /**
   * Keeps whichever deadline comes first, so a prop that owes nothing never
   * waits out a slower neighbour's timer.
   */
  protected scheduleFlush(): void {
    if (this.dirty.size === 0 || this.isPaused() || typeof window === 'undefined') {
      return
    }

    const wait = this.shortestWait()

    if (wait === null) {
      // Every dirty prop is in flight. The refresh registry reports when those
      // requests finish, which schedules the next attempt for us.
      return
    }

    // Even a flush that owes the throttle nothing waits out the collect window,
    // so props still on their way join the request rather than following it
    const delay = Math.max(COLLECT_WINDOW, wait)
    const at = Date.now() + delay

    // Strictly earlier, or a burst of events a millisecond apart would keep
    // pushing the deadline out and never fire
    if (this.pending && at >= this.pending.at) {
      return
    }

    this.clearTimeout()

    this.pending = {
      at,
      timeoutId: window.setTimeout(() => {
        this.pending = null
        this.attemptFlush()
      }, delay),
    }
  }

  /**
   * Null for a prop a request in flight already claims, since reloading it risks
   * overwriting fresher data with an older response.
   */
  protected waitFor(key: string, now: number): number | null {
    const ref = this.liveProps.get(key)

    if (!ref || propRefreshes.isRefreshing(ref.prop, ref.layerId)) {
      return null
    }

    return throttleWait(ref.entry.throttle ?? this.throttle, this.flushedAt.get(key), now)
  }

  protected shortestWait(): number | null {
    const now = Date.now()

    const waits = Array.from(this.dirty)
      .map((prop) => this.waitFor(prop, now))
      .filter((wait): wait is number => wait !== null)

    return waits.length > 0 ? Math.min(...waits) : null
  }

  protected attemptFlush(): void {
    if (this.isPaused()) {
      return
    }

    const now = Date.now()
    const ready = Array.from(this.dirty).filter((prop) => this.waitFor(prop, now) === 0)

    if (ready.length > 0) {
      ready.forEach((prop) => this.flushedAt.set(prop, now))
      this.flush(ready)
    }

    this.scheduleFlush()
  }

  protected flush(ready: string[]): void {
    ready.forEach((prop) => this.dirty.delete(prop))

    const refs = ready.map((key) => this.liveProps.get(key)).filter((ref): ref is LivePropRef => ref !== undefined)

    groupByTier(refs).forEach((reloaded, layerId) => {
      router.reload({
        only: reloaded.map((ref) => ref.prop),
        preserveErrors: true,
        ...(layerId !== undefined && { layerId }),
      })
    })
  }

  protected clearTimeout(): void {
    if (this.pending) {
      window.clearTimeout(this.pending.timeoutId)
      this.pending = null
    }
  }
}

export const live = new Live()

export const configureLive = (option: LiveOption): void => live.configure(option)
