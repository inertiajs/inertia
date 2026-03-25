import {
  createHeadManager,
  type LayoutCallbackReturn,
  type LayoutProps,
  Page,
  PageHandler,
  PageProps,
  router,
  SharedPageProps,
} from '@inertiajs/core'
import { Component, DefineComponent, VNode } from 'vue'
import useForm from './useForm'

export type VuePageHandlerArgs = Parameters<PageHandler<DefineComponent>>[0]
export type VueInertiaAppConfig = {}

export type LayoutCallback = (props: SharedPageProps) => LayoutCallbackReturn<Component>
export type LayoutRenderFunction = (h: (component: Component, children: Component[]) => VNode, page: Component) => VNode

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
    layout?:
      | ((props: any) => any)
      | LayoutRenderFunction
      | DefineComponent<any, any, any>
      | DefineComponent<any, any, any>[]
      | [DefineComponent<any, any, any>, Record<string, unknown>?]
      | (DefineComponent<any, any, any> | [DefineComponent<any, any, any>, Record<string, unknown>?])[]
      | { component: DefineComponent<any, any, any>; props?: Record<string, unknown> }
      | Record<
          string,
          | DefineComponent<any, any, any>
          | [DefineComponent<any, any, any>, Record<string, unknown>?]
          | { component: DefineComponent<any, any, any>; props?: Record<string, unknown> }
        >
      | Partial<LayoutProps>
    remember?:
      | string
      | string[]
      | {
          data: string | string[]
          key?: string | (() => string)
        }
  }
}
