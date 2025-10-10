import { createHeadManager, Page, PageHandler, router } from '@inertiajs/core'
import { DefineComponent } from 'vue'
import useForm from './useForm'

export type VuePageHandlerArgs = Parameters<PageHandler>[0] & {
  component: DefineComponent
}

declare module '@inertiajs/core' {
  export interface Router {
    form: typeof useForm
  }
}

declare module 'vue' {
  export interface ComponentCustomProperties {
    $inertia: typeof router
    $page: Page
    $headManager: ReturnType<typeof createHeadManager>
  }

  export interface ComponentCustomOptions {
    remember?:
      | string
      | string[]
      | {
          data: string | string[]
          key?: string | (() => string)
        }
  }
}
