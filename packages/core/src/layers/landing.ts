import { router } from '..'
import { fireBeforeUpdateEvent } from '../events'
import { history } from '../history'
import {
  addressLayer,
  addressOf,
  composeColdLayer,
  composeLayer,
  isBlankBase,
  isLayerResponse,
  layerAt,
  layerBaseOf,
  layerKeyOf,
  layersOf,
  nextLayerId,
  openLayerFor,
  promoteDeepestLayer,
  promoteLayer,
  responseTarget,
  tierOf,
  withTier,
} from '../layers'
import { page as currentPage } from '../page'
import type { RequestParams } from '../requestParams'
import { BaseSnapshot, LayerState, Page, Target } from '../types'
import { hrefToUrl, isSameUrlWithoutHash, setHashIfSameUrl, urlWithoutHash } from '../url'
import { layerClosing } from './closing'
import { registryClose, registryRekey } from './handles'
import { mergeOncePropsInto, mergeProps, preserveEqualProps } from './merge'
import { walkContinues } from './walk'

export const insertLayerBeneath = (page: Page, response: Page, id: string): Page => {
  const composed = composeLayer({ ...page, layers: [] }, response, id, { standalone: true })

  return { ...composed, layers: [...composed.layers!, ...layersOf(page)] }
}

export interface LandingVisit {
  url: URL
  layerId?: string
  layerOwner?: string
  claims: boolean
  walk: boolean
  partial: boolean
  reload: boolean
  replace: boolean
  preserveScroll: boolean
  preserveState: boolean
  preserveUrl: boolean
}

export interface LandingInput {
  response: Page
  responseUrl: string
  live: BaseSnapshot
  baseId: string
  captured: BaseSnapshot
  visit: LandingVisit
  pinned?: DetourPin
}

interface Landing {
  page: Page
  landedOn?: string
  preserveUrl: boolean
  pin: DetourPin | undefined
  set: {
    replace: boolean
    preserveScroll: boolean
    preserveState: boolean
    preservesBase: boolean
  }
}

interface LandingPlan {
  composesAsLayer: boolean
  dismisses?: string
  land(base: Page): Landing
}

interface CarriedLayer {
  base: Page
  layerId?: string
  opening: boolean
  owner: string
  claims?: boolean
}

/** The base a layer was dispatched from, pinned through a marked detour (a password prompt, say) until the layer returns. */
interface DetourPin {
  layer: CarriedLayer
  dispatchedUrl: string
}

let pinned: DetourPin | undefined

const settleDetour = (landed: Page, next: DetourPin | undefined): void => {
  if (pinned && pinned !== next) {
    closeUnlandedLayer(landed, pinned.layer.layerId)
  }

  pinned = next
}

const pinFor = (pin: DetourPin | undefined, url: string): DetourPin | undefined =>
  pin && isSameUrlWithoutHash(hrefToUrl(pin.dispatchedUrl), hrefToUrl(url)) ? pin : undefined

const carriedLayer = (base: Page, baseId: string, { layerId, layerOwner, claims }: LandingVisit): CarriedLayer => ({
  base,
  layerId,
  opening: layerOwner !== undefined,
  owner: layerOwner ?? layerAt(base, layerId)?.id ?? baseId,
  claims,
})

const pinAfterPrompt = ({ response, baseId, captured, visit, pinned }: LandingInput): DetourPin | undefined => {
  // A prompt answering its own submit, a wrong password say, is the detour already running.
  if (response.interstitial && pinned && visit.layerOwner === undefined) {
    return pinned
  }

  return response.interstitial
    ? { layer: carriedLayer(captured.page, baseId, visit), dispatchedUrl: urlWithoutHash(visit.url).href }
    : undefined
}

const closeUnlandedLayer = (page: Page, id: string | undefined): void => {
  if (id !== undefined && !layersOf(page).some((layer) => layer.id === id)) {
    registryClose(id)
  }
}

export const attemptEnded = (page: Page, layerId: string | undefined): void => {
  if (pinned?.layer.layerId === layerId) {
    return
  }

  closeUnlandedLayer(page, layerId)
}

const capturedBaseIsValid = ({ response, responseUrl, live, captured, visit }: LandingInput, base: Page): boolean => {
  if (captured.generation !== live.generation) {
    return false
  }

  const opening = visit.layerOwner !== undefined

  if (opening) {
    return true
  }

  const sentFrom = visit.layerId ?? layersOf(captured.page).at(-1)?.id
  const key = layerKeyOf(response)
  const declaredBase = layerBaseOf(response)

  const dispatchedTowardTheLayer = isSameUrlWithoutHash(visit.url, hrefToUrl(responseUrl))
  const theLayerIsAlreadyOpen = layersOf(base).some((open) => open.key === key)
  const dispatchedFromALayerStillOpen = layersOf(base).some((open) => open.id === sentFrom)
  const standsOnThePageOnScreen =
    declaredBase !== undefined && isSameUrlWithoutHash(hrefToUrl(declaredBase), hrefToUrl(base.url))

  return dispatchedTowardTheLayer || theLayerIsAlreadyOpen || dispatchedFromALayerStillOpen || standsOnThePageOnScreen
}

// A layer that does not own the address is submitted from the tier beneath it, so that is where its errors come back.
const errorsHandedBackTo = (page: Page, response: Page, layerId: string | undefined): LayerState | undefined => {
  const layer = layerAt(page, layerId)
  const address = addressLayer(page) ?? page

  return layer &&
    address !== layer &&
    Object.keys(response.props.errors ?? {}).length > 0 &&
    response.component === address.component &&
    isSameUrlWithoutHash(hrefToUrl(response.url), hrefToUrl(addressOf(page)))
    ? layer
    : undefined
}

const composedLayerId = (base: Page, response: Page, { layerId, opening, claims }: CarriedLayer): string => {
  const open = openLayerFor(base, response, layerId) ?? (claims ? layerAt(base, layerId) : undefined)
  const opensNew = opening && layerId !== undefined
  const taken = layersOf(base).some((layer) => layer.id === layerId)

  const id = open ? open.id : opensNew && !taken ? layerId : nextLayerId(base)

  if (opensNew && id !== layerId) {
    registryRekey(layerId, id)
  }

  return id
}

const handErrorsBack = (landing: Landing, response: Page, handedBackTo: LayerState): void => {
  const landedOn = tierOf(landing.page, landing.landedOn)

  landing.page = withTier(
    withTier(landing.page, landing.landedOn, { props: { ...landedOn.props, errors: {} }, flash: {} }),
    handedBackTo.id,
    { props: { ...handedBackTo.props, errors: response.props.errors }, flash: landedOn.flash },
  )
  landing.landedOn = handedBackTo.id
}

export const planLanding = (input: LandingInput): LandingPlan => {
  const { response, responseUrl, live, baseId, visit } = input
  const page = live.page
  const isLayer = isLayerResponse(response)
  const walksBeneath = visit.walk
  const refreshesInPlace = visit.partial || visit.reload
  const staysOnBaseComponent = response.component === page.component

  const handedBackTo = errorsHandedBackTo(page, response, visit.layerId)
  const landsOnTheBase = staysOnBaseComponent && isSameUrlWithoutHash(hrefToUrl(response.url), hrefToUrl(page.url))
  const refreshesBase = (refreshesInPlace && landsOnTheBase) || handedBackTo !== undefined
  const keepsStack =
    ((refreshesInPlace && (staysOnBaseComponent || isBlankBase(page))) || handedBackTo !== undefined) &&
    layersOf(page).length > 0

  const carry = isLayer && !walksBeneath ? pinFor(input.pinned, responseUrl) : undefined
  const composesAsLayer = !walksBeneath && isLayer && (carry !== undefined || capturedBaseIsValid(input, page))
  const carriedReturn = composesAsLayer && carry !== undefined
  const pin = !isLayer && !walksBeneath ? pinAfterPrompt(input) : carriedReturn ? undefined : input.pinned
  const landsOverTheStack = composesAsLayer || handedBackTo !== undefined

  // A refresh in place or a form handed back names no level; only a navigation closes the stack down to its layer.
  const rewrites =
    composesAsLayer && !refreshesInPlace && handedBackTo === undefined
      ? openLayerFor(page, response, visit.layerId)
      : undefined
  const dismisses = rewrites ? layersOf(page)[layersOf(page).indexOf(rewrites) + 1]?.id : undefined

  const land = (base: Page): Landing => {
    const carried = carry?.layer ?? carriedLayer(base, baseId, visit)
    const standsOn = isLayer ? layerBaseOf(response) : undefined
    let walksTo: string | undefined

    const landing: Landing = {
      page: response,
      preserveUrl: visit.preserveUrl,
      pin,
      set: {
        // The layer's entry takes the prompt's place, so back lands on the base, not a dead prompt.
        replace: carriedReturn || visit.replace,
        preserveScroll: landsOverTheStack || visit.preserveScroll,
        preserveState: landsOverTheStack || visit.preserveState,
        preservesBase: landsOverTheStack || walksBeneath || refreshesBase,
      },
    }

    if (composesAsLayer) {
      const id = composedLayerId(carried.base, response, carried)
      const open = layerAt(carried.base, id)

      landing.page = composeLayer(carried.base, response, id, {
        url: visit.preserveUrl && open ? open.url : responseUrl,
        preservesUrl: visit.preserveUrl,
        owner: carried.owner,
        remount: !visit.preserveState,
        claims: carried.claims,
      })
      landing.landedOn = id
      landing.preserveUrl = visit.preserveUrl && !!open
    } else if (walksBeneath && standsOn !== undefined) {
      const id = nextLayerId(base)

      landing.page = insertLayerBeneath(base, response, id)
      walksTo = standsOn
      landing.landedOn = id
    } else if (walksBeneath) {
      landing.page = { ...promoteLayer(response), layers: base.layers }
    } else if (standsOn !== undefined) {
      const id = carried.layerId ?? nextLayerId(base)

      landing.preserveUrl = false
      landing.page = composeColdLayer(response, id, responseUrl, carried.owner)
      walksTo = standsOn
      landing.landedOn = id
    } else if (isLayer) {
      landing.page = promoteLayer(response)
    } else if (keepsStack) {
      landing.page = { ...response, layers: base.layers }
    }

    if (walksTo !== undefined && !walkContinues(landing.page, walksTo)) {
      landing.page = promoteDeepestLayer(landing.page)
      landing.landedOn = undefined
    }

    if (handedBackTo) {
      handErrorsBack(landing, response, handedBackTo)
    }

    return landing
  }

  return { composesAsLayer, dismisses, land }
}

const pageUrl = (response: Page, visitUrl: URL): string => {
  const responseUrl = hrefToUrl(response.url)

  if (response.preserveFragment) {
    responseUrl.hash = visitUrl.hash
  } else {
    setHashIfSameUrl(visitUrl, responseUrl)
  }

  return responseUrl.pathname + responseUrl.search + responseUrl.hash
}

const preserveOptimisticProps = (response: Page, target: Target | undefined): void => {
  if (!target || !router.hasPendingOptimistic()) {
    return
  }

  const id = target.layer?.id

  for (const key of Object.keys(response.props)) {
    if (currentPage.hasBaseline(key, id)) {
      currentPage.updateBaseline(key, response.props[key], id)
      response.props[key] = target.state.props[key]
    }
  }
}

const rememberedStateInto = async (response: Page, params: RequestParams): Promise<void> => {
  const rememberedState = await history.getState<Page['rememberedState']>(history.rememberedState, {})

  if (params.all().preserveState && rememberedState && response.component === currentPage.get().component) {
    response.rememberedState = rememberedState
  }
}

const landingVisit = (params: RequestParams): LandingVisit => {
  const { url, layerId, layerOwner, replace, preserveScroll, preserveState } = params.all()

  return {
    url,
    layerId,
    layerOwner,
    claims: params.claims(),
    walk: params.isWalkRequest(),
    partial: params.isPartial(),
    reload: params.isReload(),
    replace,
    preserveScroll: preserveScroll as boolean,
    preserveState: preserveState as boolean,
    preserveUrl: history.preserveUrl,
  }
}

// Props are merged only once the plan says it lands in that layer; a promoted response keeps its own.
export const landResponse = async (
  response: Page,
  params: RequestParams,
  captured: BaseSnapshot,
): Promise<string | undefined> => {
  const target = responseTarget(currentPage.get(), response, params.all().layerId)

  if (target && !target.layer) {
    mergeProps(response, target.state, params)
  }

  mergeOncePropsInto(response, target?.state)
  preserveOptimisticProps(response, target)
  preserveEqualProps(response, target?.state)

  await rememberedStateInto(response, params)

  params.setPreserveOptions(response)

  // `preserveUrl` puts the base's url on the response, so the layer's own is held here.
  const responseUrl = pageUrl(response, params.all().url)

  response.url = history.preserveUrl ? currentPage.get().url : responseUrl

  const plan = planLanding({
    response,
    responseUrl,
    live: { page: currentPage.get(), generation: currentPage.generation() },
    baseId: currentPage.id(),
    captured,
    visit: landingVisit(params),
    pinned,
  })

  if (plan.dismisses !== undefined) {
    await layerClosing.dismiss(plan.dismisses)
  }

  if (plan.composesAsLayer && target?.layer) {
    mergeProps(response, target.state, params)
  }

  const landing = plan.land(currentPage.get())

  settleDetour(landing.page, landing.pin)

  history.preserveUrl = landing.preserveUrl

  params.all().onBeforeUpdate(landing.page)
  fireBeforeUpdateEvent(landing.page)

  await currentPage.set(landing.page, {
    ...landing.set,
    viewTransition: params.all().viewTransition,
    cached: params.all().cached,
    visitId: params.all().id,
  })

  return landing.landedOn
}
