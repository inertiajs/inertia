import { Router } from './router'

export { getScrollableParent } from './domUtils'
export { hasFiles } from './files'
export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager } from './head'
export { default as useInfiniteScroll } from './infiniteScroll'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { default as usePrecognition } from './precognition'
export { hide as hideProgress, progress, reveal as revealProgress, default as setupProgress } from './progress'
export { resetFormFields } from './resetFormFields'
export * from './types'
export { hrefToUrl, isUrlMethodPair, mergeDataIntoQueryString, urlWithoutHash } from './url'
export { type Router }

export const router = new Router()
