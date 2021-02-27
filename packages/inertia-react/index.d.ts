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

export interface InertiaFormProps {
	data: object
	errors: object
	hasErrors: boolean
	processing: boolean
	progress: number
	wasSuccessful: boolean
	recentlySuccessful: boolean
	setData: (...prop: [key?: string | object | (() => void), value?: any]) => void
	transform: (callback: () => void) => void
	reset: (fields?: object) => void
	clearErrors: (fields?: object) => void
	submit: (method: () => void, url: string, options?: Inertia.VisitOptions) => Promise<void>
	get: (url: string, data?: object, options?: Inertia.VisitOptions) => Promise<void>
	patch: (url: string, data?: object, options?: Inertia.VisitOptions) => Promise<void>
	post: (url: string, data?: object, options?: Inertia.VisitOptions) => Promise<void>
	put: (url: string, data?: object, options?: Inertia.VisitOptions) => Promise<void>
	delete: (url: string, options?: Inertia.VisitOptions) => Promise<void>

}

type useForm = (initialValues: { [key: string]: any }) => InertiaFormProps

type InertiaLinkProps = BaseInertiaLinkProps & Omit<React.HTMLAttributes<HTMLElement>, 'onProgress'> & React.AllHTMLAttributes<HTMLElement>

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

export const useForm: useForm
