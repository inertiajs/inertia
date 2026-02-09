import { Config } from './config'
import { Router } from './router'

export { UseFormUtils } from './useFormUtils'

export { axiosAdapter } from './axiosHttpClient'
export { config } from './config'
export { getInitialPageFromDOM, getScrollableParent } from './domUtils'
export { hasFiles } from './files'
export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager } from './head'
export { http } from './http'
export { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
export { default as useInfiniteScroll } from './infiniteScroll'
export {
  createLayoutPropsStore,
  mergeLayoutProps,
  normalizeLayouts,
  type LayoutDefinition,
  type LayoutPropsStore,
} from './layout'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { progress, default as setupProgress } from './progress'
export { FormComponentResetSymbol, resetFormFields } from './resetFormFields'
export * from './types'
export {
  hrefToUrl,
  isSameUrlWithoutQueryOrHash,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  urlHasProtocol,
  urlToString,
  urlWithoutHash,
} from './url'
export { XhrHttpClient, xhrHttpClient } from './xhrHttpClient'
export { type Config, type Router }

export const router = new Router()
