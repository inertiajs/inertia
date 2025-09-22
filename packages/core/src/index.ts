import { Progress } from './progress'
import { Router } from './router'

export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager } from './head'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { hide as hideProgress, reveal as revealProgress, default as setupProgress } from './progress'
export { resetFormFields } from './resetFormFields'
export * from './types'
export { hrefToUrl, isUrlMethodPair, mergeDataIntoQueryString, urlWithoutHash } from './url'
export { type Progress, type Router }

export const progress = new Progress()
export const router = new Router()
