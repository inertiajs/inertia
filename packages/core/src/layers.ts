import { omit } from 'es-toolkit'
import { Layer, LayerState, Page, PageProps, Target, Tier } from './types'
import { hrefToUrl } from './url'

let sequence = 0

let renderSequence = 0

export const nextRenderKey = (): number => ++renderSequence

// The counters belong to the document being rendered, and an SSR process renders many.
export const resetLayerSequence = (): void => {
  sequence = 0
  renderSequence = 0
}

export const layersOf = (page: Page): LayerState[] => page.layers ?? []

export const isBlankBase = (page: Pick<Page, 'component'>): boolean => page.component === ''

export const loadingBase = (page: Page): string | undefined => {
  if (!isBlankBase(page)) {
    return undefined
  }

  return layersOf(page)[0]?.base ?? (layersOf(page).length === 0 && page.url !== '' ? page.url : undefined)
}

export const targetAt = (page: Page, layerId: string | undefined): Target => {
  const layer = layerAt(page, layerId)

  return { layer, state: layer ?? page, page: layer ? layerPageOf(page, layer) : page }
}

export const layerAt = (page: Page, id: string | undefined): LayerState | undefined =>
  id === undefined ? undefined : layersOf(page).find((layer) => layer.id === id)

export const tierOf = (page: Page, id: string | undefined): Tier => layerAt(page, id) ?? page

export const mapLayers = (page: Page, fn: (layer: LayerState) => LayerState): Page =>
  page.layers ? { ...page, layers: page.layers.map(fn) } : page

export const withTier = (page: Page, id: string | undefined, fields: Partial<LayerState>): Page =>
  id === undefined
    ? ({ ...page, ...fields } as Page)
    : mapLayers(page, (layer) => (layer.id === id ? { ...layer, ...fields } : layer))

// A layer's own bag, so a base key named after a layer id survives that layer closing.
export const rememberedStateOf = (page: Partial<Page>, layerId?: string): Page['rememberedState'] =>
  (layerId ? layersOf(page as Page).find((layer) => layer.id === layerId)?.rememberedState : page.rememberedState) ?? {}

// History keeps ids the counter has forgotten, so an id is checked against the stack it joins.
export const nextLayerId = (base: Page): string => {
  const taken = new Set(layersOf(base).map((layer) => layer.id))

  let id: string

  do {
    id = `layer-${++sequence}`
  } while (taken.has(id))

  return id
}

export const isLayerResponse = (page: Page): boolean => typeof page.layer === 'object' && page.layer !== null

export const layerKeyOf = (response: Page): string => response.layer?.key || response.component

export const layerBaseOf = (response: Page): string | undefined => response.layer?.base

export const promoteLayer = (response: Page): Page => omit(response, ['layers', 'layer']) as Page

export const openLayerFor = (page: Page, response: Page, id?: string): LayerState | undefined => {
  const key = layerKeyOf(response)
  const matches = layersOf(page).filter((layer) => !layer.local && layer.key === key)

  return matches.find((layer) => layer.id === id) ?? matches[0]
}

export const responseTarget = (page: Page, response: Page, layerId?: string): Target | undefined => {
  if (!isLayerResponse(response)) {
    return targetAt(page, undefined)
  }

  const open = openLayerFor(page, response, layerId)

  return open ? targetAt(page, open.id) : undefined
}

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
  'closing',
] as const

const tierState = (layer: LayerState): Tier => omit(layer, stackFields)

export const publicLayerOf = ({ id, key, component, url }: LayerState): Layer => ({ id, key, component, url })

interface ComposeOptions {
  url?: string | null
  standalone?: boolean
  owner?: string | null
  local?: boolean
  preservesUrl?: boolean
  remount?: boolean
  claims?: boolean
}

const layerFromResponse = (response: Page, url: string | null) => ({
  key: layerKeyOf(response),
  base: layerBaseOf(response) ?? null,
  component: response.component,
  props: response.props,
  url,
  encryptHistory: response.encryptHistory ?? false,
  deferredProps: response.deferredProps ?? {},
  initialDeferredProps: response.initialDeferredProps ?? response.deferredProps,
  rescuedProps: response.rescuedProps ?? [],
  flash: response.flash ?? {},
  onceProps: response.onceProps ?? {},
  scrollProps: response.scrollProps ?? {},
})

export const composeLayer = (base: Page, response: Page, id: string, options: ComposeOptions = {}): Page => {
  const { url = response.url, standalone = false, owner = null, local = false, preservesUrl = false } = options
  const { remount = false, claims = false } = options
  const layers = layersOf(base)
  const rewrites =
    standalone || local ? undefined : (openLayerFor(base, response, id) ?? (claims ? layerAt(base, id) : undefined))

  const onTheStack = rewrites
    ? {
        id: rewrites.id,
        renderKey: remount ? nextRenderKey() : rewrites.renderKey,
        standalone: rewrites.standalone,
        entries: rewrites.entries,
        owner: rewrites.owner ?? owner,
        ...(local ? { local: true } : {}),
        // Decided when the layer opened: a later partial or poll must not move the address onto it.
        ...(rewrites.preservesUrl ? { preservesUrl: true } : {}),
        ...(rewrites.closing ? { closing: true as const } : {}),
      }
    : {
        id,
        renderKey: nextRenderKey(),
        standalone,
        entries: 0,
        owner,
        ...(local ? { local: true } : {}),
        ...(preservesUrl ? { preservesUrl: true } : {}),
      }

  const layer: LayerState = { ...onTheStack, ...layerFromResponse(response, url) }

  return {
    ...base,
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
      rememberedState: {},
    } as Page,
    response,
    id,
    { url, standalone: true, owner },
  )

export const promoteDeepestLayer = (page: Page): Page => {
  const [deepest, ...above] = layersOf(page)

  if (!deepest) {
    return page
  }

  const base = omit(page, ['layers'])

  const promoted = {
    ...base,
    ...tierState(deepest),
    url: deepest.url ?? base.url,
    encryptHistory: base.encryptHistory || deepest.encryptHistory,
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

// A close marks the layer and every layer above it; the shell reports each exit before they leave the stack.
export const markClosing = (page: Page, id: string): Page => {
  const index = layersOf(page).findIndex((layer) => layer.id === id)

  return index === -1
    ? page
    : { ...page, layers: page.layers!.map((layer, at) => (at >= index ? { ...layer, closing: true } : layer)) }
}

export const entriesToUnwind = (page: Page, id: string): number => {
  const index = layersOf(page).findIndex((layer) => layer.id === id)

  return index === -1 ? 0 : page.layers!.slice(index).reduce((entries, layer) => entries + layer.entries, 0)
}

export const withoutClosingMarks = (page: Page): Page => mapLayers(page, ({ closing, ...layer }) => layer)

// Marks from a close the incoming page no longer stands on (its layer remounted) are dropped with it.
export const withoutAbandonedMarks = (onScreen: Page, page: Page): Page => {
  const marked = layersOf(onScreen).filter((layer) => layer.closing)
  const stands = marked.every((layer) => layerAt(page, layer.id)?.renderKey === layer.renderKey)

  return marked.length === 0 || stands ? page : withoutClosingMarks(page)
}

export const withoutClosingLayers = (page: Page): Page => {
  if (!layersOf(page).some((layer) => layer.closing)) {
    return page
  }

  const beneath = omit(page, ['layers'])
  const kept = layersOf(page).filter((layer) => !layer.closing)

  return kept.length > 0 ? { ...beneath, layers: kept } : (beneath as Page)
}

export const addressLayer = (page: Page): LayerState | undefined =>
  layersOf(page)
    .filter((layer) => layer.url !== null && !layer.preservesUrl)
    .at(-1)

export const addressOf = (page: Page): string => addressLayer(page)?.url ?? page.url

// A reload asks for the tier's own url, or the address when the base stands alone.
export const reloadUrlOf = (page: Page, layerId: string | undefined, address: string): string =>
  layerAt(page, layerId)?.url ?? (layersOf(page).length > 0 ? page.url : address)

export const withAddressHash = (page: Page, hash: string): Page => {
  const owner = addressLayer(page)
  const url = hrefToUrl(owner?.url ?? page.url)

  url.hash = hash

  return withTier(page, owner?.id, { url: url.href })
}

export const withBrowserHash = (page: Page, hash = typeof window === 'undefined' ? '' : window.location.hash): Page => {
  const owner = addressLayer(page)
  const url = owner?.url ?? page.url

  return hash && !url.includes(hash) ? withTier(page, owner?.id, { url: url + hash }) : page
}

// One entry holds every tier, so anything short of the union writes one layer's props in plaintext.
export const encryptsHistory = (page: Page): boolean =>
  !!page.encryptHistory || layersOf(page).some((layer) => layer.encryptHistory)

export const recordHistoryEntry = (page: Page): Page => withTopEntries(page, 1)

export const dropHistoryEntry = (page: Page): Page => withTopEntries(page, -1)

const withTopEntries = (page: Page, by: number): Page => {
  const top = layersOf(page).at(-1)

  return top === undefined ? page : withTier(page, top.id, { entries: Math.max(0, top.entries + by) })
}

export const layerPageOf = (page: Page, layer: LayerState): Page => {
  const index = layersOf(page).findIndex((open) => open.id === layer.id)

  return {
    ...tierState(layer),
    props: { ...layer.props, errors: layer.props.errors ?? {} },
    url: layer.url ?? addressOf(index === -1 ? page : { ...page, layers: page.layers!.slice(0, index) }),
    version: page.version,
    clearHistory: page.clearHistory,
    layers: page.layers?.map(publicLayerOf) as LayerState[],
    rememberedState: layer.rememberedState ?? {},
  } as Page
}

export const topPageOf = (page: Page): Page => {
  const top = layersOf(page).at(-1)

  return top ? layerPageOf(page, top) : page
}
