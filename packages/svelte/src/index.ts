import { config as coreConfig } from '@inertiajs/core'
import type { SvelteInertiaAppConfig } from './types'

export { progress, router } from '@inertiajs/core'
export { default as App } from './components/App.svelte'
export { default as Deferred } from './components/Deferred.svelte'
export { default as Form } from './components/Form.svelte'
export { useFormContext } from './components/formContext'
export { default as InfiniteScroll } from './components/InfiniteScroll.svelte'
export { default as Link } from './components/Link.svelte'
export { default as WhenVisible } from './components/WhenVisible.svelte'
export { default as configureInertiaApp } from './configureInertiaApp'
export { default as createInertiaApp } from './createInertiaApp'
export { default as inertia } from './link'
export { default as page, usePage } from './page.svelte'
export { type ResolvedComponent, type SvelteInertiaAppConfig } from './types'
export {
  default as useForm,
  type InertiaForm,
  type InertiaFormProps,
  type InertiaPrecognitiveForm,
} from './useForm.svelte'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch.svelte'
export { default as useRemember } from './useRemember.svelte'

export const config = coreConfig.extend<SvelteInertiaAppConfig>({})
