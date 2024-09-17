import { Router } from './router'

export { getActiveHead } from 'unhead'
export { renderSSRHead } from '@unhead/ssr'
export type { SSRHeadPayload } from '@unhead/ssr'
export { default as setupProgress } from './progress'
export { default as shouldIntercept } from './shouldIntercept'
export * from './types'
export { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash } from './url'
export { type Router }

export const router = new Router()
