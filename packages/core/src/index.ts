import { Router } from './router'

export { default as createHeadManager } from './head'
export { setupModal } from './modal'
export { default as setupProgress, hide as hideProgress, reveal as revealProgress } from './progress'
export { default as shouldIntercept } from './shouldIntercept'
export * from './types'
export { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash } from './url'
export { type Router }

export const router = new Router()
