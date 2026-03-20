import { PageHandler, SharedPageProps } from '@inertiajs/core'
import { ComponentType, ReactNode } from 'react'

export type LayoutFunction = (page: ReactNode) => ReactNode
export type LayoutCallback = (props: SharedPageProps) => unknown
export type LayoutComponent = ComponentType<{ children: ReactNode }>

export type ReactComponent = ComponentType<any> & {
  layout?: LayoutComponent | LayoutComponent[] | LayoutFunction | LayoutCallback
}

export type ReactPageHandlerArgs = Parameters<PageHandler<ComponentType>>[0]
export type ReactInertiaAppConfig = {
  strictMode?: boolean
}
