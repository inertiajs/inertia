import { createHeadManager, Page, PageHandler, PageProps, router, SharedPageProps } from '@inertiajs/core'
import { DefineComponent } from 'vue'
import useForm from './useForm'

export type VuePageHandlerArgs = Omit<Parameters<PageHandler>[0], 'component'> & {
  component: DefineComponent | Promise<DefineComponent>
}

declare module '@inertiajs/core' {
  export interface Router {
    form: typeof useForm
  }
}

declare module 'vue' {
  export interface ComponentCustomProperties {
    $inertia: typeof router
    $page: Page<PageProps & SharedPageProps>
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
