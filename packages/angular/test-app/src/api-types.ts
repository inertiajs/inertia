import { Component, type Signal, type Type } from '@angular/core'
import {
  Deferred,
  Form,
  Head,
  InfiniteScroll,
  Link,
  WhenVisible,
  config,
  createForm,
  h,
  useForm,
  useFormContext,
  useHttp,
  useLayoutProps,
  usePage,
  type AngularCreateInertiaAppOptions,
  type AngularRenderNode,
  type DeferredTemplateContext,
  type InertiaForm,
  type InertiaFormComponent,
  type InertiaLinkProps,
  type ResolvedComponent,
  type WhenVisibleTemplateContext,
} from '@inertiajs/angular'
import { renderAngularApp, type RenderAngularAppOptions } from '@inertiajs/angular/server'
import type { Page } from '@inertiajs/core'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false
type Expect<Value extends true> = Value

type FormShape = {
  name: string
  profile: { email: string | null }
  tags: string[]
}

@Component({ template: '' })
class TypeFixturePage {}

const resolved: ResolvedComponent = TypeFixturePage
const renderNode: AngularRenderNode = h(TypeFixturePage)
const formType = createForm<FormShape>()
const linkProps: InertiaLinkProps = { href: '/users' }
const angularConfig: AngularCreateInertiaAppOptions = { resolve: () => resolved }
const serverConfig: RenderAngularAppOptions = { resolve: () => resolved }
const directives: Type<unknown>[] = [Deferred, Form, Head, InfiniteScroll, Link, WhenVisible]
const contextTypes: [DeferredTemplateContext, WhenVisibleTemplateContext] = [{ reloading: false }, { fetching: false }]

declare const form: InertiaForm<FormShape>
declare const formComponent: InertiaFormComponent<FormShape>
declare const page: Page
declare const pageSignal: ReturnType<typeof usePage>

type _PageIsSignal = Expect<Equal<typeof pageSignal, Signal<Page>>>
type _FormName = Expect<Equal<ReturnType<typeof form.data>['name'], string>>

form.setData('profile.email', null)
form.reset('tags')
formComponent.reset('profile.email')

// @ts-expect-error Unknown form paths must not compile.
form.setData('profile.unknown', 'value')
// @ts-expect-error Values must match the selected nested path.
form.setData('profile.email', 42)
// @ts-expect-error Form component reset paths are checked too.
formComponent.reset('missing')

function injectionContextOnly(): void {
  const helper = useForm<FormShape>({ name: '', profile: { email: null }, tags: [] })
  const request = useHttp<FormShape>({ name: '', profile: { email: null }, tags: [] })
  const context = useFormContext<FormShape>()
  const layouts = useLayoutProps()

  layouts.set({ title: 'Users' })
  layouts.setFor('app', { theme: 'dark' })
  // @ts-expect-error Named layout keys are supplied through module augmentation.
  layouts.setFor('missing', {})
  // @ts-expect-error Named layout values remain strongly typed.
  layouts.setFor('content', { maxWidth: 42 })

  void [helper, request, context]
}

void [
  angularConfig,
  config,
  contextTypes,
  directives,
  formType,
  injectionContextOnly,
  linkProps,
  page,
  renderAngularApp,
  renderNode,
  serverConfig,
]
