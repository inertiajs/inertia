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

interface InertiaLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  data?: object
  href: string
  method?: string
  onClick?: (
    event:
      | React.MouseEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLAnchorElement>
  ) => void
  preserveScroll?: boolean | ((props: Inertia.PageProps) => boolean)
  preserveState?: boolean | ((props: Inertia.PageProps) => boolean)
  replace?: boolean
  only?: string[]
}

type InertiaLink = React.FunctionComponent<InertiaLinkProps>

export function usePage<
  PageProps extends Inertia.PageProps = Inertia.PageProps
>(): PageProps

export function useRememberedState<RememberedState>(
  initialState: RememberedState,
  key?: string
): [RememberedState, React.Dispatch<React.SetStateAction<RememberedState>>]

export const InertiaLink: InertiaLink

export const InertiaApp: App
