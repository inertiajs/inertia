import { config as coreConfig, http as Http, progress as Progress, router as Router } from '@inertiajs/core'
import { ReactInertiaAppConfig } from './types'

export const http = Http
export const progress = Progress
export const router = Router
export { default as App } from './App'
export { default as createInertiaApp } from './createInertiaApp'
export { default as Deferred } from './Deferred'
export { default as Form, useFormContext } from './Form'
export { default as Head } from './Head'
export { default as InfiniteScroll } from './InfiniteScroll'
export { setLayoutProps, setLayoutPropsFor, useLayoutProps } from './layoutProps'
export { InertiaLinkProps, default as Link } from './Link'
export { ReactComponent as ResolvedComponent } from './types'
export {
  InertiaFormProps,
  InertiaPrecognitiveFormProps,
  SetDataAction,
  SetDataByKeyValuePair,
  SetDataByMethod,
  SetDataByObject,
  default as useForm,
} from './useForm'
export { default as useHttp } from './useHttp'
export { default as usePage } from './usePage'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch'
export { default as useRemember } from './useRemember'
export { default as WhenVisible } from './WhenVisible'

export const config = coreConfig.extend<ReactInertiaAppConfig>()
