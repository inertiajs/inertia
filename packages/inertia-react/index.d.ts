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
}>

interface BaseInertiaLinkProps {
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

type InertiaLinkProps = BaseInertiaLinkProps & Omit<React.HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> & Omit<React.AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps>

type InertiaLink = React.FunctionComponent<InertiaLinkProps>

export function usePage<
  Page extends Inertia.Page = Inertia.Page
>(): Page

export function useRemember<State>(
  initialState: State,
  key?: string
): [State, React.Dispatch<React.SetStateAction<State>>]

export const InertiaLink: InertiaLink

export const Link: InertiaLink

export const InertiaApp: App

export const App: App

type setDataByObject<TForm> = (data: TForm) => void
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
type setDataByKeyValuePair<TForm> = <K extends keyof TForm>(key: K, value: TForm[K]) => void

export interface InertiaFormProps<TForm = Record<string, any>> {
	data: TForm
	errors: Record<keyof TForm, string>
	hasErrors: boolean
	processing: boolean
	progress: number
	wasSuccessful: boolean
	recentlySuccessful: boolean
	setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByKeyValuePair<TForm>
	transform: (callback: (data: TForm) => TForm) => void
	reset: (...fields: (keyof TForm)[]) => void
	clearErrors: (...fields: (keyof TForm)[]) => void
	submit: (method: () => void, url: string, options?: Inertia.VisitOptions) => Promise<void>
	get: (url: string, options?: Inertia.VisitOptions) => Promise<void>
	patch: (url: string, options?: Inertia.VisitOptions) => Promise<void>
	post: (url: string, options?: Inertia.VisitOptions) => Promise<void>
	put: (url: string, options?: Inertia.VisitOptions) => Promise<void>
	delete: (url: string, options?: Inertia.VisitOptions) => Promise<void>
}

export function useForm<TForm = Record<string, any>>(initialValues: TForm): InertiaFormProps<TForm>;
