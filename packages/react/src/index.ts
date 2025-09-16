import { router as Router } from '@inertiajs/core'

export const router = Router
export { default as createInertiaApp } from './createInertiaApp'
export { default as Deferred } from './Deferred'
export { default as Form } from './Form'
export { default as Head } from './Head'
export { default as InfiniteScroll, type InfiniteScrollProps } from './InfiniteScroll'
export { InertiaLinkProps, default as Link } from './Link'
export {
  InertiaFormProps,
  SetDataAction,
  SetDataByKeyValuePair,
  SetDataByMethod,
  SetDataByObject,
  default as useForm,
} from './useForm'
export { default as usePage } from './usePage'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch'
export { default as useRemember } from './useRemember'
export { default as WhenVisible } from './WhenVisible'
