import { Router } from './router'

export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager } from './head'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { hide as hideProgress, progress, reveal as revealProgress, default as setupProgress } from './progress'
export { resetFormFields } from './resetFormFields'
export * from './types'
export { appURL, asset, hrefToUrl, isBrowser, isUrlMethodPair, mergeDataIntoQueryString, urlWithoutHash } from './url'
export { type Router }

export const router = new Router()
