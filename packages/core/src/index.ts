import { Router } from './router'

export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { resetFormFields } from './resetFormFields'
export { default as createHeadManager } from './head'
export { hide as hideProgress, reveal as revealProgress, default as setupProgress } from './progress'
export { default as shouldIntercept } from './shouldIntercept'
export * from './types'
export { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash, isUrlMethodPair } from './url'
export { type Router }

export const router = new Router()
