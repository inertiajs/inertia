import { PageHandler } from '@inertiajs/core'
import { ComponentType, ReactNode } from 'react'

export type LayoutFunction = (page: ReactNode) => ReactNode
export type LayoutComponent = ComponentType<{ children: ReactNode }>

export type ReactComponent = ComponentType<any> & {
  layout?: LayoutComponent | LayoutComponent[] | LayoutFunction
}

export type ReactPageHandlerArgs = Parameters<PageHandler<ComponentType>>[0]
export type ReactInertiaAppConfig = {}
