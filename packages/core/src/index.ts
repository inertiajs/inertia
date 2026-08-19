import { Config } from './config'
import { Router } from './router'

export { UseFormUtils } from './useFormUtils'

export { axiosAdapter } from './axiosHttpClient'
export { config } from './config'
export { getInitialPageFromDOM, getScrollableParent } from './domUtils'
export { hasFiles } from './files'
export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager, resolveServerHead } from './head'
/** @internal Not part of the public API. May change or be removed without notice. */
export { canRenderClientOnly, markClientRendered, setHydrationBoot } from './hydrationBoot'
export { http } from './http'
export { HttpCancelledError, HttpError, HttpNetworkError, HttpResponseError } from './httpErrors'
export { default as useInfiniteScroll } from './infiniteScroll'
/** @internal Not part of the public API. May change or be removed without notice. */
export { exposeInterceptors, interceptors } from './interceptors'
export {
  createLayoutPropsStore,
  isPropsObject,
  isPropsObjectOrCallback,
  normalizeLayouts,
  type LayoutCallbackReturn,
  type LayoutDefinition,
  type LayoutPropsStore,
} from './layout'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { isPathOrSubPath, partialReloadRequestsProp, partialReloadRequestsSomeProps } from './partialReload'
export { progress, default as setupProgress } from './progress'
export { FormComponentResetSymbol, resetFormFields } from './resetFormFields'
export { buildSSRBody } from './ssrUtils'
export * from './types'
export {
  hrefToUrl,
  isSameUrlWithoutQueryOrHash,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resolveUrlMethodPairComponent,
  urlHasProtocol,
  urlToString,
  urlWithoutHash,
} from './url'
export { XhrHttpClient, xhrHttpClient } from './xhrHttpClient'
export { type Config, type Router }

export const router = new Router()
