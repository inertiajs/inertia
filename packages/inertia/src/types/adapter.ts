import { ErrorBag, Errors, Page } from '.'

export type Component = unknown
export type PageResolver = (name: string) => Component
export type Props = Record<string, unknown>
export type PropTransformer = (props: Props) => Props
export type ErrorResolver = (page: Page) => Errors | ErrorBag
export type PageHandler = ({ component, page, preserveState }: { component: Component, page: Page, preserveState: boolean|((page: Page) => boolean) }) => Promise<unknown>
