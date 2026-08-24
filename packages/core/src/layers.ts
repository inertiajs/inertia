import { omit } from 'es-toolkit'
import { router } from '.'
import { history } from './history'
import { page as currentPage } from './page'
import {
  BaseSnapshot,
  Layer,
  LayerShellProps,
  LayerState,
  LoadingOption,
  LocalLayer,
  Page,
  PageProps,
  ResolvedLayer,
  UrlMethodPair,
} from './types'
import { hrefToUrl, isSameUrlWithoutHash } from './url'

let sequence = 0

// A layer's component is thrown away and remade unless the write that landed on it preserved state,
// which is what the page's own key does for the base.
let renderSequence = 0

export const nextRenderKey = (): number => ++renderSequence

export const layersOf = (page: Page): LayerState[] => page.layers ?? []

export const layerAt = (page: Page, id: string | undefined): LayerState | undefined =>
  id === undefined ? undefined : layersOf(page).find((layer) => layer.id === id)

export const tierOf = (page: Page, id: string | undefined): Layer => layerAt(page, id) ?? page

export const mapLayers = (page: Page, fn: (layer: LayerState) => LayerState): Page =>
  page.layers ? { ...page, layers: page.layers.map(fn) } : page

// Writes fields onto one tier: the layer the id names, or the page itself when it names none.
export const withTier = (page: Page, id: string | undefined, fields: Partial<LayerState>): Page =>
  id === undefined
    ? ({ ...page, ...fields } as Page)
    : mapLayers(page, (layer) => (layer.id === id ? { ...layer, ...fields } : layer))

// History keeps ids the counter has forgotten, so an id is checked against the stack it joins.
export const nextLayerId = (base: Page): string => {
  const taken = new Set(layersOf(base).map((layer) => layer.id))

  let id: string

  do {
    id = `layer-${++sequence}`
  } while (taken.has(id))

  return id
}

export const isLocalLayer = (target: string | URL | UrlMethodPair | LocalLayer): target is LocalLayer =>
  typeof target === 'object' && 'component' in target

// The mark's presence is what makes a response a layer, so an empty mark still counts.
export const isLayerResponse = (page: Page): boolean => typeof page.layer === 'object' && page.layer !== null

export const layerKeyOf = (response: Page): string => response.layer?.key || response.component

export const layerBaseOf = (response: Page): string | undefined => response.layer?.base

export const promoteLayer = (response: Page): Page => {
  const { layers, layer, ...page } = response

  return page as Page
}

// A layer composes only while the base it was dispatched from is still the one on screen.
export const capturedBaseIsValid = ({
  captured,
  live,
  dispatchedUrl,
  dispatchedFrom,
  opening = false,
  layer,
}: {
  captured: BaseSnapshot
  live: BaseSnapshot
  dispatchedUrl: URL
  dispatchedFrom?: string
  opening?: boolean
  layer: { url: string; key: string; base?: string }
}): boolean => {
  if (captured.generation !== live.generation) {
    return false
  }

  if (opening) {
    // The call named the layer it wanted, so a create that redirects to the record still opens it.
    return true
  }

  // A bare router call from inside a layer carries no tier, so the stack it left stands in for one.
  const sentFrom = dispatchedFrom ?? layersOf(captured.page).at(-1)?.id

  const dispatchedTowardTheLayer = isSameUrlWithoutHash(dispatchedUrl, hrefToUrl(layer.url))
  const theLayerIsAlreadyOpen = layersOf(live.page).some((open) => open.key === layer.key)
  const dispatchedFromALayerStillOpen = layersOf(live.page).some((open) => open.id === sentFrom)
  // The layer names the page it stands on and that page is on screen, so a plain create that
  // redirects to the record opens over the list it was posted from rather than walking one back.
  const standsOnThePageOnScreen =
    layer.base !== undefined && isSameUrlWithoutHash(hrefToUrl(layer.base), hrefToUrl(live.page.url))

  return dispatchedTowardTheLayer || theLayerIsAlreadyOpen || dispatchedFromALayerStillOpen || standsOnThePageOnScreen
}

// The layer a response belongs to: one open under the same key is that layer coming back, not a new one.
export const openLayerFor = (page: Page, response: Page, id?: string): LayerState | undefined => {
  const key = layerKeyOf(response)
  const matches = layersOf(page).filter((layer) => !layer.local && layer.key === key)

  return matches.find((layer) => layer.id === id) ?? matches[0]
}

// What a layer holds by being on the stack, rather than by being a tier.
const stackFields = [
  'id',
  'key',
  'base',
  'standalone',
  'entries',
  'owner',
  'local',
  'preservesUrl',
  'renderKey',
] as const

const tierState = (layer: LayerState): Layer => omit(layer, stackFields)

// What a visit carries into its landing, the id being the one `router.layer()` minted.
export interface CarriedLayer {
  base: Page
  layerId?: string
  opening: boolean
  owner: string
  claims?: boolean
}

// An instant visit puts a placeholder in the layer it was aimed at, and only its own response can
// claim that placeholder. Claimed by id rather than by key: the key is the server's to choose, and
// the placeholder went up before the server had said anything.
const claimedPlaceholder = (base: Page, id: string | undefined, claims?: boolean): LayerState | undefined =>
  claims ? layerAt(base, id) : undefined

const composedLayerId = (base: Page, response: Page, { layerId, opening, claims }: CarriedLayer): string => {
  const open = openLayerFor(base, response, layerId) ?? claimedPlaceholder(base, layerId, claims)
  const mints = opening && layerId !== undefined
  const taken = layersOf(base).some((layer) => layer.id === layerId)

  const id = open ? open.id : mints && !taken ? layerId : nextLayerId(base)

  if (mints && id !== layerId) {
    registryRekey(layerId, id)
  }

  return id
}

export const composeLayer = (
  base: Page,
  response: Page,
  id: string,
  {
    url = response.url,
    standalone = false,
    owner = null,
    local = false,
    preservesUrl = false,
    remount = false,
    claims = false,
  }: {
    url?: string | null
    standalone?: boolean
    owner?: string | null
    local?: boolean
    preservesUrl?: boolean
    remount?: boolean
    claims?: boolean
  } = {},
): Page => {
  const layers = layersOf(base)
  const rewrites =
    standalone || local ? undefined : (openLayerFor(base, response, id) ?? claimedPlaceholder(base, id, claims))
  // Settled when the layer opened: a later partial or poll must not move the address onto it.
  const preserves = rewrites ? rewrites.preservesUrl : preservesUrl

  const layer: LayerState = {
    id: rewrites?.id ?? id,
    key: layerKeyOf(response),
    renderKey: rewrites && !remount ? rewrites.renderKey : nextRenderKey(),
    component: response.component,
    props: response.props,
    url,
    base: layerBaseOf(response) ?? null,
    encryptHistory: response.encryptHistory ?? false,
    standalone: rewrites?.standalone ?? standalone,
    entries: rewrites?.entries ?? 0,
    owner: rewrites?.owner ?? owner,
    deferredProps: response.deferredProps ?? {},
    initialDeferredProps: response.initialDeferredProps ?? response.deferredProps,
    rescuedProps: response.rescuedProps ?? [],
    flash: response.flash ?? {},
    onceProps: response.onceProps ?? {},
    scrollProps: response.scrollProps ?? {},
    ...(local ? { local: true } : {}),
    ...(preserves ? { preservesUrl: true } : {}),
  }

  return {
    ...base,
    // The asset version rides on the page, not the tier, so the composite takes the one it landed on.
    version: response.version,
    clearHistory: base.clearHistory || response.clearHistory,
    layers: rewrites ? layers.map((open) => (open === rewrites ? layer : open)) : [...layers, layer],
  }
}

export const composeLocalLayer = (base: Page, component: string, props: PageProps, id: string, owner: string): Page =>
  composeLayer(base, { component, props, layer: {}, url: null, version: base.version } as unknown as Page, id, {
    url: null,
    owner,
    local: true,
  })

export const composeColdLayer = (
  response: Page,
  id: string,
  url: string | null = response.url,
  owner: string | null = null,
): Page =>
  composeLayer(
    {
      component: '',
      props: { errors: {} },
      url: layerBaseOf(response)!,
      version: response.version,
      rescuedProps: [],
      flash: response.flash,
      // State is remembered against a page the user was on, and nobody has been on this one.
      rememberedState: {},
    } as Page,
    response,
    id,
    { url, standalone: true, owner },
  )

export const insertLayerBeneath = (page: Page, response: Page, id: string): Page => {
  const composed = composeLayer({ ...page, layers: [] }, response, id, { standalone: true })

  return { ...composed, layers: [...composed.layers!, ...layersOf(page)] }
}

// A walk that stops leaves its deepest layer drawn over nothing, so that layer becomes the page.
export const promoteDeepestLayer = (page: Page): Page => {
  const [deepest, ...above] = layersOf(page)

  if (!deepest) {
    return page
  }

  const { layers, ...base } = page

  const promoted = {
    ...base,
    ...tierState(deepest),
    url: deepest.url ?? base.url,
    encryptHistory: base.encryptHistory || deepest.encryptHistory,
    // Both tiers' flash was announced when it was set, and isn't announced again here.
    flash: {},
  } as Page

  return above.length > 0 ? { ...promoted, layers: above } : promoted
}

export const closeLayer = (page: Page, id: string): Page => {
  const index = layersOf(page).findIndex((layer) => layer.id === id)

  if (index === -1) {
    return page
  }

  const { layers, ...beneath } = page

  return index === 0 ? (beneath as Page) : { ...beneath, layers: layers!.slice(0, index) }
}

// A layer that never made it onto the stack has no removal to fire its onClose, so the visit does.
export const closeUnlandedLayer = (page: Page, id: string | undefined): void => {
  if (id !== undefined && !layersOf(page).some((layer) => layer.id === id)) {
    registryClose(id)
  }
}

// The topmost layer whose url the visit that opened it left free to own.
const addressLayer = (page: Page): LayerState | undefined =>
  layersOf(page)
    .filter((layer) => layer.url !== null && !layer.preservesUrl)
    .at(-1)

export const addressOf = (page: Page): string => addressLayer(page)?.url ?? page.url

// The tier the address belongs to, which is the page itself when no layer owns it.
export const addressTierOf = (page: Page): Layer => addressLayer(page) ?? page

// A hash belongs on the url the address is read from: on the base it never reaches the address bar.
export const withAddressHash = (page: Page, hash: string): Page => {
  const owner = addressLayer(page)
  const url = hrefToUrl(owner?.url ?? page.url)

  url.hash = hash

  return withTier(page, owner?.id, { url: url.href })
}

// A stack can name a base that has since been remounted: by a restore, or by a detour returning its
// layer over the page the prompt replaced. Left as it was, what the stack emits reaches nobody.
export const withLiveOwners = (page: Page, baseId: string): Page => {
  const open = new Set(layersOf(page).map((layer) => layer.id))

  return mapLayers(page, (layer) =>
    layer.owner !== null && !open.has(layer.owner) ? { ...layer, owner: baseId } : layer,
  )
}

// The layer a restore dismisses, if that is what it is: a step back onto the entry the top layer
// was opened over, which is the browser doing by hand what closing the layer does. A layer that
// pushed entries of its own sits further back than one step, and a jump that lands anywhere else
// is a navigation, not a dismissal.
export const layerDismissedByRestore = (page: Page, restored: Page): LayerState | undefined => {
  const open = layersOf(page)
  const top = open.at(-1)
  const beneath = layersOf(restored)

  if (!top || top.entries !== 1 || beneath.length !== open.length - 1) {
    return undefined
  }

  const stands = (tier: Layer, was: Layer) => tier.component === was.component && tier.url === was.url

  return stands(restored, page) &&
    beneath.every((layer, index) => layer.id === open[index].id && stands(layer, open[index]))
    ? top
    : undefined
}

// A restore whose base is the page already on screen: only the stack moved, and remounting the base
// would throw away the state the stack was opened over.
export const restoreKeepsBase = (page: Page, restored: Page): boolean =>
  layersOf(restored).length > 0 && restored.component === page.component && restored.url === page.url

const withoutRemembered = (page: Page, layerIds: string[]): Page => ({
  ...page,
  rememberedState: Object.fromEntries(
    Object.entries(page.rememberedState ?? {}).filter(([key]) => !layerIds.includes(key)),
  ),
})

export const withoutFlash = (page: Page): Page => ({
  ...mapLayers(page, (layer) => ({ ...layer, flash: {} })),
  flash: {},
})

// One entry holds every tier, so anything short of the union writes one layer's props in plaintext.
export const encryptsHistory = (page: Page): boolean =>
  !!page.encryptHistory || layersOf(page).some((layer) => layer.encryptHistory)

// Every entry pushed while a layer is on screen is one that closing it has to step back over.
export const recordHistoryEntry = (page: Page): Page => withTopEntries(page, 1)

export const dropHistoryEntry = (page: Page): Page => withTopEntries(page, -1)

const withTopEntries = (page: Page, by: number): Page => {
  const top = layersOf(page).at(-1)

  return top === undefined ? page : withTier(page, top.id, { entries: Math.max(0, top.entries + by) })
}

export const entriesToUnwind = (page: Page, id: string): number => {
  const index = layersOf(page).findIndex((layer) => layer.id === id)

  return index === -1 ? 0 : page.layers!.slice(index).reduce((entries, layer) => entries + layer.entries, 0)
}

// The entries the dropped layers owned fall to the layer beneath them.
const absorbLayersAbove = (page: Page, id: string): Page => {
  const layers = layersOf(page)
  const index = layers.findIndex((layer) => layer.id === id)
  const entries = entriesToUnwind(page, id)
  const kept = layers.slice(0, index)
  const beneath = kept.at(-1)

  return {
    ...page,
    layers: beneath ? [...kept.slice(0, -1), { ...beneath, entries: beneath.entries + entries }] : kept,
  }
}

export const maxLayerChain = 10

// A base already on the stack would send the walk round in circles.
const walkContinues = (page: Page, base: string): boolean => {
  const layers = layersOf(page)
  const fetchedFrom = (url: string | null) => url !== null && isSameUrlWithoutHash(hrefToUrl(url), hrefToUrl(base))

  if (layers.some((layer) => fetchedFrom(layer.url))) {
    return false
  }

  if (layers.length >= maxLayerChain) {
    console.warn(
      `A layer chain more than ${maxLayerChain} layers deep was declared, so "${base}" was not fetched. The deepest layer that loaded is being used as the page.`,
    )

    return false
  }

  return true
}

export const missingBase = (page: Page): string | undefined =>
  page.component === '' ? (layersOf(page)[0]?.base ?? undefined) : undefined

// The url a blank base is waiting on: the base its layer declared, or its own once the stack that
// declared it was dismissed and the recovery is fetching it.
export const loadingBase = (page: Page): string | undefined =>
  missingBase(page) ?? (page.component === '' && layersOf(page).length === 0 && page.url !== '' ? page.url : undefined)

export interface LayerLanding {
  page: Page
  walksTo?: string
  landedOn?: string
  preserveUrl: boolean
}

export const landLayerResponse = ({
  base,
  response,
  responseUrl,
  composesAsLayer,
  walksBeneath,
  remount,
  carried,
  preserveUrl,
  keepsStack,
}: {
  base: Page
  response: Page
  responseUrl: string
  composesAsLayer: boolean
  walksBeneath: boolean
  remount: boolean
  carried: CarriedLayer
  preserveUrl: boolean
  keepsStack: boolean
}): LayerLanding => {
  const landing: LayerLanding = { page: response, preserveUrl }
  const isLayer = isLayerResponse(response)
  const standsOn = isLayer ? layerBaseOf(response) : undefined

  if (composesAsLayer) {
    const id = composedLayerId(carried.base, response, carried)
    const open = layerAt(carried.base, id)

    landing.page = composeLayer(carried.base, response, id, {
      url: preserveUrl && open ? open.url : responseUrl,
      preservesUrl: preserveUrl,
      owner: carried.owner,
      remount,
      claims: carried.claims,
    })
    landing.landedOn = id
    // An open is a step of its own, so the layer carries the preservation and writes its entry.
    landing.preserveUrl = preserveUrl && !!open
  } else if (walksBeneath && standsOn !== undefined) {
    const id = nextLayerId(base)

    landing.page = insertLayerBeneath(base, response, id)
    landing.walksTo = standsOn
    landing.landedOn = id
  } else if (walksBeneath) {
    landing.page = { ...promoteLayer(response), layers: base.layers }
  } else if (standsOn !== undefined) {
    // Nothing valid to sit on, but it says what it belongs on, so the walk fetches that beneath it.
    const id = carried.layerId ?? nextLayerId(base)

    landing.preserveUrl = false
    landing.page = composeColdLayer(response, id, responseUrl, carried.owner)
    landing.walksTo = standsOn
    landing.landedOn = id
  } else if (isLayer) {
    landing.page = promoteLayer(response)
  } else if (keepsStack) {
    landing.page = { ...response, layers: base.layers }
  }

  if (landing.walksTo !== undefined && !walkContinues(landing.page, landing.walksTo)) {
    landing.page = promoteDeepestLayer(landing.page)
    landing.walksTo = undefined
    landing.landedOn = undefined
  }

  return landing
}

export interface LayerHandle {
  id: string
  /** Hears what this layer's immediate children emit, and returns its own unsubscribe. */
  on(name: string, callback: (payload?: unknown, childId?: string) => void): () => void
  /** The same, for the first one only. */
  once(name: string, callback: (payload?: unknown, childId?: string) => void): () => void
  onClose(callback: () => void): () => void
  close(): Promise<void>
  /** Sends an event to whatever opened this layer; dropped when that has no handle of its own. */
  emit(name: string, payload?: unknown): void
  /** @internal */
  deliver(childId: string, name: string, payload?: unknown): void
  /** @internal */
  fireOnClose(): void
}

// Handles live beside the page, never on it, so no history entry carries them. An id can be
// re-opened while older handles still point at it, so each one holds a list.
const layerRegistry = new Map<string, LayerHandle[]>()

export const registryWrite = (id: string, entry: LayerHandle): void => {
  layerRegistry.set(id, [...(layerRegistry.get(id) ?? []), entry])
}

export const registryRead = (id: string): LayerHandle | undefined => layerRegistry.get(id)?.at(-1)

export const registryHas = (id: string): boolean => layerRegistry.has(id)

export const registryClose = (id: string): void => {
  layerRegistry.get(id)?.forEach((handle) => handle.fireOnClose())
  layerRegistry.delete(id)
}

// Moves handles onto the id the layer actually composed under. Left where they were minted, they
// would answer for a layer that never opened.
const registryRekey = (from: string, to: string): void => {
  const moving = layerRegistry.get(from)

  if (moving === undefined) {
    return
  }

  moving.forEach((handle) => (handle.id = to))
  layerRegistry.set(to, [...(layerRegistry.get(to) ?? []), ...moving])
  layerRegistry.delete(from)
}

export const layerHandleFor = (id: string, mint: (id: string) => LayerHandle): LayerHandle => {
  if (typeof window === 'undefined') {
    // Nothing emits or closes during a render, so the handle is spent with the render that asks.
    return mint(id)
  }

  const existing = registryRead(id)

  if (existing) {
    return existing
  }

  const handle = mint(id)

  registryWrite(id, handle)

  return handle
}

export const createLayerHandle = (
  id: string,
  close: (id: string) => Promise<void>,
  ownerOf: (id: string) => string | null | undefined,
): LayerHandle => {
  const subscriptions = new Map<string, ((payload?: unknown, childId?: string) => void)[]>()
  const onCloseCallbacks: (() => void)[] = []

  const deliver = (childId: string, name: string, payload?: unknown): void => {
    for (const callback of subscriptions.get(name) ?? []) {
      callback(payload, childId)
    }
  }

  const handle: LayerHandle = {
    id,
    on: (name, callback) => {
      subscriptions.set(name, [...(subscriptions.get(name) ?? []), callback])

      return () =>
        subscriptions.set(
          name,
          (subscriptions.get(name) ?? []).filter((subscribed) => subscribed !== callback),
        )
    },
    once: (name, callback) => {
      const stop = handle.on(name, (payload, childId) => {
        stop()
        callback(payload, childId)
      })

      return stop
    },
    onClose: (callback) => {
      onCloseCallbacks.push(callback)

      return () => {
        const at = onCloseCallbacks.indexOf(callback)

        if (at > -1) {
          onCloseCallbacks.splice(at, 1)
        }
      }
    },
    close: () => close(handle.id),
    emit: (name, payload) => {
      const owner = ownerOf(handle.id)

      if (owner === null || owner === undefined) {
        return
      }

      layerRegistry.get(owner)?.forEach((ownerHandle) => ownerHandle.deliver(handle.id, name, payload))
    },
    deliver,
    fireOnClose: () => {
      for (const callback of onCloseCallbacks) {
        callback()
      }
    },
  }

  return handle
}

// How long an unwind waits for the browser. Settling early installs a page it is about to replace.
const unwindTimeout = 1000

type Deferred = { settled: Promise<void>; settle: () => void }

const deferred = (): Deferred => {
  let settle!: () => void

  return { settled: new Promise<void>((resolve) => (settle = resolve)), settle }
}

export interface CloseOptions {
  // The app asked for the close (router.close / handle.close), which refreshes what it lands on.
  programmatic?: boolean
  refresh?: (address: string, layerId?: string) => Promise<void>
  // The caller installs the page these layers leave behind, so the removal writes nothing itself.
  absorbed?: boolean
}

// The close sequence runs in three steps: a layer is marked, the shell reports back once it has run
// its exit, and only then is it taken off the stack, stepping back over the entries it owned.
class LayerClosing {
  // The layers a close is waiting on, deepest first.
  protected pending: { id: string; reported: boolean }[] = []
  protected options: CloseOptions | undefined
  protected unwinding: (Deferred & { landsItself: boolean }) | null = null
  protected closing: Deferred | null = null
  protected removing: string[] = []

  public close(id?: string, options: CloseOptions = {}): Promise<void> {
    if (this.unwinding) {
      // The last close's layers stay on screen until the browser restores the entry beneath them.
      return Promise.resolve()
    }

    const layers = layersOf(currentPage.get())
    const index = id === undefined ? layers.length - 1 : layers.findIndex((layer) => layer.id === id)

    if (index === -1) {
      return Promise.resolve()
    }

    if (this.isClosing(layers[index].id)) {
      return this.closing?.settled ?? Promise.resolve()
    }

    // Widening restates which layers are owed, not what they have reported.
    this.pending = layers.slice(index).map((layer) => ({
      id: layer.id,
      reported: this.pending.find((marked) => marked.id === layer.id)?.reported ?? false,
    }))
    this.options = options

    const closing = (this.closing ??= deferred())

    return currentPage.rerender().then(() => closing.settled)
  }

  // Closes everything above a layer without stepping back, since the caller is about to install
  // the page that takes them off the screen.
  public async closeAbove(id: string | undefined): Promise<void> {
    const layers = layersOf(currentPage.get())
    const index = id === undefined ? -1 : layers.findIndex((layer) => layer.id === id)
    const above = index === -1 ? undefined : layers[index + 1]

    if (!above) {
      return
    }

    await this.close(above.id, { absorbed: true })
  }

  public closed(id?: string): Promise<void> {
    const marked = id === undefined ? this.pending.at(-1) : this.pending.find((layer) => layer.id === id)

    if (!marked) {
      return Promise.resolve()
    }

    marked.reported = true

    if (!this.pending.every((layer) => layer.reported)) {
      return Promise.resolve()
    }

    const closed = this.pending.map((layer) => layer.id)
    const options = this.options
    const closing = this.closing
    this.pending = []
    this.options = undefined
    // Handed to the removal, so a close marked while this one refreshes waits on one of its own.
    this.closing = null

    return this.remove(closed, options, closing).finally(() => closing?.settle())
  }

  protected remove(
    closed: string[],
    { programmatic = false, refresh, absorbed = false }: CloseOptions = {},
    closing?: Deferred | null,
  ): Promise<void> {
    const layer = layerAt(currentPage.get(), closed[0])

    if (!layer) {
      return Promise.resolve()
    }

    if (absorbed) {
      // Nothing steps back: the caller pushes its own entry in front of the ones these layers own.
      currentPage.merge(withoutRemembered(absorbLayersAbove(currentPage.get(), closed[0]), closed))
      currentPage.dropLayerOptimisticState(closed)
      closed.forEach(registryClose)

      return Promise.resolve()
    }

    this.removing = closed

    const entries = entriesToUnwind(currentPage.get(), layer.id)
    // A layer the user was never behind opened on an entry of its own, so the step back lands on the
    // entry still holding it and the close installs the page beneath rather than leaving it to the
    // restore. That entry is the one the user arrived on, so the page beneath it is a step of its
    // own: only a layer that never got an entry writes over the one it is being closed out of.
    const writesTheEntry = layer.standalone || entries === 0
    const replaces = entries === 0 && !layer.standalone

    const land = () =>
      currentPage.set(closeLayer(currentPage.get(), layer.id), {
        replace: replaces,
        preserveScroll: true,
        preserveState: true,
        preservesBase: true,
      })

    let removal: Promise<void>

    if (entries > 0) {
      removal = this.beginUnwind(land, writesTheEntry)
      history.back(entries)

      if (writesTheEntry) {
        removal = removal.then(async () => {
          // Unless the wait ran out and already landed it.
          if (layerAt(currentPage.get(), layer.id)) {
            await land()
          }
        })
      }
    } else {
      removal = land()
    }

    return removal.then(async () => {
      // Off the screen, which is what a close means. The refresh beneath it is a follow-up.
      closing?.settle()

      // A layer with no url of its own has nothing to re-ask for, so the base beneath it answers.
      const landedOn = layersOf(currentPage.get()).at(-1)
      const refreshed = landedOn?.url ? landedOn : undefined
      // Unless what it would re-ask for is a blank the walk has yet to fill in, which the recovery
      // is already fetching. A walk that landed leaves a base like any other, stale and worth asking.
      const recovering = refreshed === undefined && currentPage.get().component === ''

      if (programmatic && refresh && !recovering) {
        await refresh(refreshed?.url ?? currentPage.get().url, refreshed?.id)
      }

      currentPage.merge(withoutRemembered(currentPage.get(), closed))

      if (writesTheEntry) {
        history.replaceState(currentPage.getWithoutFlashData())
      }

      // Rolling the layer's optimistic back would write its keys into the base's props.
      currentPage.dropLayerOptimisticState(closed)

      this.removing = []
      closed.forEach(registryClose)
    })
  }

  protected beginUnwind(land: () => Promise<void>, landsItself: boolean): Promise<void> {
    const { settled, settle } = deferred()

    // A back() the browser refuses, a step past the start of the session say, fires no popstate,
    // so the close lands the page itself once the wait is up.
    const refused = setTimeout(() => {
      this.unwinding = null
      land().then(settle)
    }, unwindTimeout)

    this.unwinding = {
      landsItself,
      settled,
      settle: () => {
        clearTimeout(refused)
        settle()
      },
    }

    return settled
  }

  // Whether the entry the step back is heading for still holds the layer being closed. The restore
  // that answers it would put that layer back on screen, so the close installs the page instead.
  public unwindLandsItself(): boolean {
    return this.unwinding?.landsItself ?? false
  }

  public settleUnwind(): void {
    this.unwinding?.settle()
    this.unwinding = null
  }

  public unwindSettled(): Promise<void> {
    return this.unwinding?.settled ?? Promise.resolve()
  }

  public isUnwinding(): boolean {
    return this.unwinding !== null
  }

  public isClosing(id: string): boolean {
    return this.pending.some((layer) => layer.id === id)
  }

  // Abandons a close whose layer the page being written replaced.
  public reconcile(page: Page): void {
    if (this.pending.length === 0) {
      return
    }

    // Read by render key: a supersede remakes the component that was dismissed and is not the one to
    // close, while a partial or a poll rewrites the layer where it stands and leaves it closing.
    const stands = (layer: LayerState): boolean => {
      const landed = layerAt(page, layer.id)

      return landed !== undefined && landed.renderKey === layer.renderKey
    }

    if (layersOf(currentPage.get()).every((layer) => !this.isClosing(layer.id) || stands(layer))) {
      return
    }

    this.pending = []
    this.options = undefined
    this.closing?.settle()
    this.closing = null
  }

  // Fires onClose for every live layer the page that is landing no longer holds. Left to the
  // landing rather than the write, since a write a newer one supersedes takes nothing away.
  public release(page: Page): void {
    const open = new Set(layersOf(page).map((layer) => layer.id))

    layersOf(currentPage.get())
      .filter((layer) => !open.has(layer.id) && !this.removing.includes(layer.id))
      .forEach((layer) => registryClose(layer.id))
  }

  // The stack as history sees it: a dismissed layer stays on the page for the shell to animate out,
  // but must not ride into the entry it is leaving.
  public withoutClosingLayers(page: Page): Page {
    if (this.pending.length === 0) {
      return page
    }

    const { layers, ...beneath } = page
    const kept = layersOf(page).filter((layer) => !this.isClosing(layer.id))

    return kept.length > 0 ? { ...beneath, layers: kept } : (beneath as Page)
  }
}

export const layerClosing = new LayerClosing()

export const layerShellProps = (
  layer: Pick<ResolvedLayer, 'id' | 'isClosing' | 'local'>,
  index: number,
  stack: number,
): Omit<LayerShellProps, 'label'> => ({
  open: !layer.isClosing,
  index,
  isTop: index === stack - 1,
  type: layer.local ? 'local' : 'routed',
  close: () => router.close(layer.id),
  done: () => router.closed(layer.id),
})

export const layerTransitionName = (id: string): string => `inertia-layer-${id}`

// The page a layer's own code reads through usePage(): its own state, the composite's for the rest.
// A layer with no url falls through to the address beneath it, never one a layer above it owns.
export const layerPageOf = (page: Page, layer: LayerState): Page => {
  const index = layersOf(page).findIndex((open) => open.id === layer.id)

  return {
    ...tierState(layer),
    props: { ...layer.props, errors: layer.props.errors ?? {} },
    url: layer.url ?? addressOf(index === -1 ? page : { ...page, layers: page.layers!.slice(0, index) }),
    version: page.version,
    clearHistory: page.clearHistory,
    layers: page.layers,
    rememberedState: page.rememberedState,
  } as Page
}

export const topPageOf = (page: Page): Page => {
  const top = layersOf(page).at(-1)

  return top ? layerPageOf(page, top) : page
}

// The page a layer's layout resolves against. A layer with no url takes an empty one, so its
// layout never reads the address of the layer beneath it.
export const layoutPageOf = (layer: ResolvedLayer): Page => ({ ...layer.page, url: layer.url ?? '' })

export const resolveLayers = <ComponentType>(
  page: Page,
  resolve: (name: string, page: Page) => ComponentType | Promise<ComponentType>,
  isClosing: (id: string) => boolean = () => false,
): Promise<ResolvedLayer<ComponentType>[]> =>
  Promise.all(
    layersOf(page).map(async (layer) => {
      const layerPage = layerPageOf(page, layer)

      return {
        ...layer,
        page: layerPage,
        component: await resolve(layer.component, layerPage),
        isClosing: isClosing(layer.id),
      }
    }),
  )

// The fragment never reached the server, so it goes back on before anything composes.
const withBrowserHash = (response: Page): Page => {
  const hash = typeof window === 'undefined' ? '' : window.location.hash

  return hash && !response.url.includes(hash) ? { ...response, url: response.url + hash } : response
}

const composeInitialPage = (response: Page): Page => {
  // The counter belongs to the document being rendered, and an SSR process renders many.
  sequence = 0
  renderSequence = 0

  const page = withBrowserHash(response)

  if (!isLayerResponse(page)) {
    return page
  }

  const base = layerBaseOf(page)

  if (base === undefined) {
    return promoteLayer(page)
  }

  const cold = composeColdLayer(page, nextLayerId(page))

  return walkContinues(cold, base) ? cold : promoteLayer(page)
}

// The page a document renders as, which is not always the page it arrived with: a layer response
// opens over a base that still has to be fetched.
export const resolveInitialPage = async <ComponentType, PageType extends Page>(
  response: PageType,
  resolve: (name: string, page: Page) => ComponentType | Promise<ComponentType>,
  resolveLoading?: (url: string, page: Page) => ComponentType | Promise<ComponentType | undefined> | undefined,
): Promise<{ page: PageType; component?: ComponentType; layers: ResolvedLayer<ComponentType>[] }> => {
  const page = composeInitialPage(response) as PageType
  const base = loadingBase(page)

  const [component, layers] = await Promise.all([
    page.component !== ''
      ? resolve(page.component, page)
      : base === undefined
        ? undefined
        : resolveLoading?.(base, page),
    resolveLayers(page, resolve),
  ])

  return { page, component, layers }
}

// Turns the `loading` option, a component or a resolver for one, into the resolver the router
// takes. A component here is whatever the adapter renders; `rendered` recognises the output of one
// called as if it were the resolver, and `normalize` maps a module onto the component it carries.
export const normalizeLoading = <ComponentType>(
  loading: LoadingOption | undefined,
  {
    rendered = () => false,
    normalize = (value) => ((value as { default?: ComponentType })?.default || value) as ComponentType,
  }: {
    rendered?: (value: unknown) => boolean
    normalize?: (value: unknown) => ComponentType
  } = {},
): ((url: string, page: Page) => Promise<ComponentType | undefined>) | undefined => {
  if (loading === undefined) {
    return undefined
  }

  return async (url, page) => {
    if (typeof loading !== 'function') {
      return normalize(loading)
    }

    let resolved: unknown

    try {
      resolved = await (loading as (url: string, page: Page) => unknown)(url, page)
    } catch {
      // A component, not a resolver: it choked on the arguments.
      return normalize(loading)
    }

    if (resolved == null) {
      return undefined
    }

    return rendered(resolved) ? normalize(loading) : normalize(resolved)
  }
}
