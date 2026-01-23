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
export { getHttpClient, setHttpClient } from './http'
export { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
export { default as useInfiniteScroll } from './infiniteScroll'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { hide as hideProgress, progress, reveal as revealProgress, default as setupProgress } from './progress'
export { FormComponentResetSymbol, resetFormFields } from './resetFormFields'
export * from './types'
export {
  hrefToUrl,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  urlHasProtocol,
  urlToString,
  urlWithoutHash,
} from './url'
export { xhrHttpClient } from './xhrHttpClient'
export { type Config, type Router }

export const router = new Router()
