import * as Inertia from '@inertiajs/inertia'
import * as React from 'react'

type App<
  PagePropsBeforeTransform extends Inertia.PagePropsBeforeTransform = Inertia.PagePropsBeforeTransform,
  PageProps extends Inertia.PageProps = Inertia.PageProps
> = React.FunctionComponent<{
  children?: (props: {
    Component: React.ComponentType
    key: React.Key
    props: PageProps
  }) => React.ReactNode
  initialPage: Inertia.Page<PageProps>
  resolveComponent: (
    name: string
  ) => React.ComponentType | Promise<React.ComponentType>
  transformProps?: (props: PagePropsBeforeTransform) => PageProps
}>

interface InertiaLinkProps {
  as?: string
  data?: object
  href: string
  method?: string
  headers?: object
  onClick?: (
    event:
      | React.MouseEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLAnchorElement>
  ) => void
  preserveScroll?: boolean | ((props: Inertia.PageProps) => boolean)
  preserveState?: boolean | ((props: Inertia.PageProps) => boolean) | null
  replace?: boolean
  only?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: number) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
}

type InertiaLink = React.FunctionComponent<
  InertiaLinkProps & Omit<React.HTMLAttributes<HTMLElement>, 'onProgress'> & React.AllHTMLAttributes<HTMLElement>
>

export function usePage<
  Page extends Inertia.Page = Inertia.Page
>(): Page

export function useRememberedState<RememberedState>(
  initialState: RememberedState,
  key?: string
): [RememberedState, React.Dispatch<React.SetStateAction<RememberedState>>]

export const InertiaLink: InertiaLink

export const Link: InertiaLink

export const InertiaApp: App
