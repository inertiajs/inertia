import * as Inertia from '@inertiajs/inertia'
import * as React from 'react'
import { renderToString } from "react-dom/server";

export type ReactInstance = React.ReactElement;
export type ReactComponent = React.ReactNode;

export type PageResolver = (name: string) => ReactComponent|Promise<ReactComponent>|NodeRequire // TODO: When shipped, replace with: Inertia.PageResolver<ReactComponent>
export type HeadManagerOnUpdate = (elements: string[]) => void // TODO: When shipped, replace with: Inertia.HeadManagerOnUpdate
export type HeadManagerTitleCallback = (title: string) => string  // TODO: When shipped, replace with: Inertia.HeadManagerTitleCallback

export type AppType<SharedProps = Inertia.PageProps> = React.FunctionComponent<{
  children?: (props: {
    Component: React.ComponentType
    key: React.Key
    props: (Inertia.Page<SharedProps>)['props']
  }) => React.ReactNode
} & SetupOptions<unknown, SharedProps>['props']>

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
  onProgress?: (progress: Inertia.Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
}

type InertiaLinkProps = BaseInertiaLinkProps & Omit<React.HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> & Omit<React.AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps>

type InertiaLink = React.FunctionComponent<InertiaLinkProps>
	
type InertiaHeadProps = {
    title?: string
}

type InertiaHead = React.FunctionComponent<InertiaHeadProps>

export function usePage<
  Page extends Inertia.Page = Inertia.Page
>(): Page

export function useRemember<State>(
  initialState: State,
  key?: string
): [State, React.Dispatch<React.SetStateAction<State>>]

export const InertiaLink: InertiaLink

export const Link: InertiaLink

export const InertiaHead: InertiaHead

export const Head: InertiaHead

export const InertiaApp: AppType

export const App: AppType

type setDataByObject<TForm> = (data: TForm) => void
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
type setDataByKeyValuePair<TForm> = <K extends keyof TForm>(key: K, value: TForm[K]) => void

export interface InertiaFormProps<TForm = Record<string, any>> {
	data: TForm
	isDirty: boolean
	errors: Record<keyof TForm, string>
	hasErrors: boolean
	processing: boolean
	progress: Inertia.Progress | null
	wasSuccessful: boolean
	recentlySuccessful: boolean
	setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByKeyValuePair<TForm>
	transform: (callback: (data: TForm) => TForm) => void
    setDefaults(): void
    setDefaults(field: keyof TForm, value: string): void
    setDefaults(fields: Record<keyof TForm, string>): void
	reset: (...fields: (keyof TForm)[]) => void
	clearErrors: (...fields: (keyof TForm)[]) => void
    setError(field: keyof TForm, value: string): void
    setError(errors: Record<keyof TForm, string>): void
	submit: (method: Inertia.Method, url: string, options?: Inertia.VisitOptions) => void
	get: (url: string, options?: Inertia.VisitOptions) => void
	patch: (url: string, options?: Inertia.VisitOptions) => void
	post: (url: string, options?: Inertia.VisitOptions) => void
	put: (url: string, options?: Inertia.VisitOptions) => void
	delete: (url: string, options?: Inertia.VisitOptions) => void
}

export function useForm<TForm = Record<string, any>>(initialValues?: TForm): InertiaFormProps<TForm>;
export function useForm<TForm = Record<string, any>>(rememberKey: string, initialValues?: TForm): InertiaFormProps<TForm>;

export type SetupOptions<ElementType, SharedProps> = {
    el: ElementType,
    App: AppType,
    props: {
        initialPage: Inertia.Page<SharedProps>,
        initialComponent: ReactComponent,
        resolveComponent: PageResolver,
        titleCallback?: HeadManagerTitleCallback
        onHeadUpdate?: HeadManagerOnUpdate
    },
}

export type BaseInertiaAppOptions = {
    title?: HeadManagerTitleCallback,
    resolve: PageResolver,
}

export type CreateInertiaAppSetupReturnType = ReactInstance|void;
export type InertiaAppOptionsForCSR<SharedProps> = BaseInertiaAppOptions & {
    id?: string,
    page?: Inertia.Page|string,
    render?: undefined,
    setup(options: SetupOptions<HTMLElement, SharedProps>): CreateInertiaAppSetupReturnType
}

export type CreateInertiaAppSSRContent = { head: string[]; body: string };
export type InertiaAppOptionsForSSR<SharedProps> = BaseInertiaAppOptions & {
    id?: undefined,
    page: Inertia.Page|string,
    render: typeof renderToString,
    setup(options: SetupOptions<null, SharedProps>): ReactInstance
}

export function createInertiaApp<SharedProps = Inertia.PageProps>(options: InertiaAppOptionsForCSR<SharedProps>): Promise<CreateInertiaAppSetupReturnType>
export function createInertiaApp<SharedProps = Inertia.PageProps>(options: InertiaAppOptionsForSSR<SharedProps>): Promise<CreateInertiaAppSSRContent>
