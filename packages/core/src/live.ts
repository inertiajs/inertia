import { toPath } from 'es-toolkit/compat'
import { router } from '.'
import { eventHandler } from './eventHandler'
import { fireLiveEvent } from './events'
import { setPathPreservingIdentity } from './objectUtils'
import { page as currentPage } from './page'
import { propRefreshes } from './propRefreshes'
import { socketId } from './socketId'
import { LiveChannel, LiveOption, LiveOptions, LiveProp, LiveTransport, Page } from './types'
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
 * Keyed by `subscriptionKey`, which is what the transport is asked to subscribe
 * to.
 */
type Subscription = {
  channel: LiveChannel
  event: string
  props: Set<string>
}

const subscriptionKey = (channel: LiveChannel, event: string): string => `${channel.type}:${channel.name}::${event}`

/**
 * Compared the way `pendingDeferredProps` compares its own, since a partial
 * reload replaces the page object without changing which page it is.
 */
const pageKey = (page: Page): string => `${page.component}::${page.url}`

const isTransport = (live: LiveOption): live is LiveTransport => {
  return typeof (live as LiveTransport).subscribe === 'function'
}

/**
 * Everything outside this envelope belongs to the application.
 */
type LivePayload = {
  __inertia?: {
    props?: Record<string, unknown>
  }
}

/**
 * Keyed by prop dot path. A payload that carries none, or that isn't an object
 * at all, reads as an empty set, which leaves every prop of the subscription to
 * reload as it always has.
 */
const propValues = (payload: unknown): Record<string, unknown> => {
  const props = (payload as LivePayload | null | undefined)?.__inertia?.props

  return props && typeof props === 'object' ? props : {}
}

/**
 * Every page swap diffs the server's live props against the active
 * subscriptions, and an incoming event marks the props it feeds for reload in
 * one throttled partial request.
 */
class Live {
  protected transport: LiveTransport | null = null
  protected throttle = DEFAULT_THROTTLE
  protected pauseWhenHidden = true
  protected liveProps: Record<string, LiveProp> = {}
  protected subscriptions = new Map<string, Subscription>()
  protected unsubscribers = new Map<string, VoidFunction>()
  protected dirty = new Set<string>()
  protected flushedAt = new Map<string, number>()
  protected pending: { at: number; timeoutId: number } | null = null
  protected incoming = new Map<string, unknown>()
  protected incomingPage: string | null = null
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

    // Only adopt the transport's resolver if it has one, so a transport that
    // cannot report a socket id leaves an app-registered resolver alone
    if (this.transport.socketId) {
      socketId.resolveUsing(this.transport.socketId)
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
        Object.keys(this.liveProps).forEach((prop) => this.markDirty(prop, { force: true }))
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

    this.liveProps = page.liveProps ?? {}

    const desired = new Map<string, Subscription>()

    Object.entries(this.liveProps).forEach(([prop, entry]) => {
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

    // Subscribe before unsubscribing so refcounted transports keep shared
    // channels alive while the event set changes.
    desired.forEach(({ channel, event }, key) => {
      if (this.unsubscribers.has(key)) {
        return
      }

      this.unsubscribers.set(
        key,
        transport.subscribe(channel, event, (payload) => this.handleEvent(key, payload)),
      )
    })

    this.unsubscribers.forEach((unsubscribe, key) => {
      if (!desired.has(key)) {
        unsubscribe()
        this.unsubscribers.delete(key)
      }
    })

    this.dirty.forEach((prop) => {
      if (!(prop in this.liveProps)) {
        this.dirty.delete(prop)
      }
    })

    // Values are collected for the page they arrived on. A page swap leaves
    // them meaningless, even where the new page happens to declare the same
    // prop, so they go rather than land on data they never described.
    if (this.incomingPage !== pageKey(page)) {
      this.incoming.clear()
      this.incomingPage = pageKey(page)
    }

    this.incoming.forEach((_value, prop) => {
      if (!(prop in this.liveProps)) {
        this.incoming.delete(prop)
      }
    })
  }

  protected handleEvent(key: string, payload: unknown): void {
    const subscription = this.subscriptions.get(key)

    if (!subscription) {
      return
    }

    const props = Array.from(subscription.props)

    const cancelled = !fireLiveEvent({
      props,
      channel: subscription.channel,
      event: subscription.event,
      payload,
    })

    if (cancelled) {
      return
    }

    // The manifest is the whitelist. Only the props this subscription feeds can
    // be written, so a payload can never reach a prop the event has no say over.
    const values = propValues(payload)
    let received = false

    props.forEach((prop) => {
      // A request already claims this prop and read the database after the
      // broadcast did, so let the reload win and drop the value.
      const usable = prop in values && !propRefreshes.isRefreshing(prop)

      if (usable) {
        // A value supersedes a reload this prop was still queued for
        this.dirty.delete(prop)
        this.incoming.set(prop, values[prop])
        received = true

        return
      }

      this.incoming.delete(prop)
      this.markDirty(prop)
    })

    this.scheduleFlush()

    if (received) {
      this.scheduleWrite()
    }
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
    const values = Array.from(this.incoming.entries())

    this.incoming.clear()

    // `sync()` prunes values whose prop left the manifest, so a burst can be
    // emptied out before it ever gets written
    if (values.length === 0) {
      return
    }

    // Ancestors first. `setPathPreservingIdentity` rebuilds every container
    // along the path, so writing `order` after `order.total` would rebuild
    // `order` from the payload and lose the narrower write.
    values.sort(([a], [b]) => toPath(a).length - toPath(b).length)

    router.replace({
      preserveScroll: true,
      preserveState: true,
      preserveFlash: true,
      props: (props) => values.reduce((carry, [path, value]) => setPathPreservingIdentity(carry, path, value), props),
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
  protected waitFor(prop: string, now: number): number | null {
    if (propRefreshes.isRefreshing(prop)) {
      return null
    }

    return throttleWait(this.throttleFor(prop), this.flushedAt.get(prop), now)
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

  protected flush(only: string[]): void {
    only.forEach((prop) => this.dirty.delete(prop))

    router.reload({ only, preserveErrors: true })
  }

  protected throttleFor(prop: string): number {
    return this.liveProps[prop]?.throttle ?? this.throttle
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
