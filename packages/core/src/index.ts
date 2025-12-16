import { Config } from './config'
import { Router } from './router'

export { UseFormUtils } from './useFormUtils'

export { config } from './config'
export { getInitialPageFromDOM, getScrollableParent } from './domUtils'
export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager } from './head'
export { default as useInfiniteScroll } from './infiniteScroll'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { hide as hideProgress, progress, reveal as revealProgress, default as setupProgress } from './progress'
export { resetFormFields } from './resetFormFields'
export * from './types'
export { hrefToUrl, isUrlMethodPair, mergeDataIntoQueryString, urlHasHost, urlToString, urlWithoutHash } from './url'
export { type Config, type Router }

export const router = new Router()
