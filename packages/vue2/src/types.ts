import { PageHandler } from '@inertiajs/core'
import { ComponentPublicInstance } from 'vue'
import useForm from './useForm'

export type VuePageHandlerArgs = Parameters<PageHandler>[0] & {
  component: ComponentPublicInstance | Promise<ComponentPublicInstance>
}

declare module '@inertiajs/core' {
  export interface Router {
    form: typeof useForm
  }
}
