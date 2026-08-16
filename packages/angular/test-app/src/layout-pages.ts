import { Component, afterNextRender, effect, input, signal } from '@angular/core'
import {
  LayoutOutlet,
  Link,
  useLayoutProps,
  usePage,
  type AngularRenderFunction,
  type ResolvedComponent,
} from '@inertiajs/angular'

@Component({
  selector: 'test-default-layout',
  imports: [LayoutOutlet],
  template: '<div id="default-layout"><span>Default Layout</span><inertia-layout-outlet /></div>',
})
export class DefaultLayout {}

@Component({
  selector: 'test-page-layout',
  imports: [LayoutOutlet],
  template: '<div id="page-layout"><span>Page Layout</span><inertia-layout-outlet /></div>',
})
class PageLayout {}

@Component({
  selector: 'test-app-layout',
  imports: [LayoutOutlet],
  template: `
    <div class="app-layout" [attr.data-theme]="theme()">
      <header>
        <h1 class="app-title">{{ formatTitle() ? formatTitle()!('User') : title() }}</h1>
      </header>
      <div class="app-content">
        @if (showSidebar()) {
          <aside class="sidebar"><span>Sidebar</span></aside>
        }
        <main><inertia-layout-outlet /></main>
      </div>
    </div>
  `,
})
export class AppLayout {
  readonly title = input('Default Title')
  readonly showSidebar = input(true)
  readonly theme = input('light')
  readonly formatTitle = input<((name: string) => string) | undefined>(undefined)
  readonly id = globalThis.crypto.randomUUID()

  constructor() {
    afterNextRender(() => {
      window._inertia_app_layout_id = this.id
    })
  }
}

@Component({
  selector: 'test-content-layout',
  imports: [LayoutOutlet],
  template: `
    <div class="content-layout" [attr.data-padding]="padding()" [attr.data-max-width]="maxWidth()">
      <div class="content-wrapper"><inertia-layout-outlet /></div>
    </div>
  `,
})
class ContentLayout {
  readonly padding = input('md')
  readonly maxWidth = input('lg')
  readonly id = globalThis.crypto.randomUUID()

  constructor() {
    afterNextRender(() => {
      window._inertia_content_layout_id = this.id
    })
  }
}

@Component({
  selector: 'test-site-layout',
  imports: [LayoutOutlet],
  template: '<div><span>Site Layout</span><span>{{ createdAt }}</span><inertia-layout-outlet /></div>',
})
class SiteLayout {
  readonly page = usePage()
  readonly id = globalThis.crypto.randomUUID()
  readonly createdAt = Date.now()

  constructor() {
    afterNextRender(() => {
      window._inertia_layout_id = this.id
      window._inertia_site_layout_props = this.page().props
    })
  }
}

@Component({
  selector: 'test-nested-layout',
  imports: [LayoutOutlet],
  template: '<div><span>Nested Layout</span><span>{{ createdAt }}</span><inertia-layout-outlet /></div>',
})
class NestedLayout {
  readonly page = usePage()
  readonly id = globalThis.crypto.randomUUID()
  readonly createdAt = Date.now()

  constructor() {
    afterNextRender(() => {
      window._inertia_nested_layout_id = this.id
      window._inertia_nested_layout_props = this.page().props
    })
  }
}

@Component({
  selector: 'test-default-layout-index',
  imports: [Link],
  template: `
    <span id="text">DefaultLayout/Index</span>
    <a inertiaLink href="/default-layout/with-own-layout">With Own Layout</a>
    <a inertiaLink href="/default-layout/callback-excluded">Callback Excluded</a>
  `,
})
class DefaultLayoutIndex {}

@Component({
  selector: 'test-default-layout-own',
  imports: [Link],
  template: '<span id="text">DefaultLayout/WithOwnLayout</span><a inertiaLink href="/default-layout">Back to Index</a>',
})
class DefaultLayoutOwn {
  static layout = PageLayout
}

@Component({
  selector: 'test-default-layout-excluded',
  imports: [Link],
  template:
    '<span id="text">DefaultLayout/CallbackExcluded</span><a inertiaLink href="/default-layout">Back to Index</a>',
})
class DefaultLayoutExcluded {}

@Component({
  selector: 'test-layout-props-body',
  imports: [Link],
  template: `
    <h2>{{ page().component }}</h2>
    @if (page().component === 'LayoutProps/Basic') {
      <button type="button" (click)="toggleSidebar()">Toggle Sidebar</button>
      <button type="button" (click)="layout.set({ title: 'Updated Title' })">Update Title</button>
      <a inertiaLink href="/layout-props/navigate">Go to Navigate Page</a>
    } @else if (page().component === 'LayoutProps/NamedDynamic') {
      <button type="button" (click)="layout.setFor('app', { title: 'Updated App Title' })">Update App Title</button>
      <button type="button" (click)="layout.setFor('content', { padding: 'xl' })">Update Content Padding</button>
    } @else if (page().component === 'LayoutProps/PersistentA') {
      <a inertiaLink href="/layout-props/persistent-b">Go to Page B</a>
    } @else if (page().component === 'LayoutProps/PersistentB') {
      <a inertiaLink href="/layout-props/persistent-a">Go to Page A</a>
    } @else if (page().component === 'LayoutProps/Default') {
      <a inertiaLink href="/layout-props/static">Go to Static Page</a>
    } @else {
      <a inertiaLink href="/layout-props/basic">Go to Basic Page</a>
    }
  `,
})
class LayoutPropsBody {
  readonly page = usePage()
  readonly layout = useLayoutProps()
  readonly sidebarVisible = signal(true)

  toggleSidebar(): void {
    this.sidebarVisible.update((visible) => !visible)
    this.layout.set({ showSidebar: this.sidebarVisible() })
  }
}

const layoutPropsTemplate = '<test-layout-props-body />'

@Component({ selector: 'test-layout-basic', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutBasic {
  static layout = [AppLayout, { title: 'Basic Layout Props', showSidebar: true }]
}

@Component({ selector: 'test-layout-static', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutStatic {
  static layout = [AppLayout, { title: 'Static Props Page', showSidebar: false, theme: 'dark' }]
}

@Component({ selector: 'test-layout-named', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutNamed {
  static layout = {
    app: [AppLayout, { title: 'Named Layouts Page', showSidebar: true, theme: 'light' }],
    content: [ContentLayout, { padding: 'xl', maxWidth: '2xl' }],
  }
}

@Component({ selector: 'test-layout-navigate', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutNavigate {
  static layout = [AppLayout, { title: 'Navigate Page', showSidebar: false, theme: 'dark' }]
}

@Component({ selector: 'test-layout-nested', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutNested {
  static layout = [
    [AppLayout, { title: 'Nested Layouts', showSidebar: true, theme: 'dark' }],
    [ContentLayout, { padding: 'lg', maxWidth: 'xl' }],
  ]
}

@Component({ selector: 'test-layout-named-static', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutNamedStatic {
  static layout = {
    app: [AppLayout, { title: 'Named Layouts with Static Props', theme: 'dark' }],
    content: [ContentLayout, { padding: 'sm', maxWidth: '4xl' }],
  }
}

@Component({ selector: 'test-layout-default', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutDefault {
  static layout = AppLayout
}

@Component({ selector: 'test-layout-persistent-a', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutPersistentA {
  static layout = {
    app: [AppLayout, { title: 'Persistent Page A' }],
    content: [ContentLayout, { padding: 'lg' }],
  }
}

@Component({ selector: 'test-layout-persistent-b', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutPersistentB {
  static layout = {
    app: [AppLayout, { title: 'Persistent Page B' }],
    content: [ContentLayout, { padding: 'xl' }],
  }
}

@Component({ selector: 'test-layout-callback', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutCallback {
  static layout = (props: Record<string, unknown>) => [
    AppLayout,
    { title: `Profile: ${String(props['userName'])}`, showSidebar: false },
  ]
}

@Component({ selector: 'test-layout-callback-default', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutCallbackDefault {
  static layout = (props: Record<string, unknown>) => ({
    title: `Profile: ${String(props['userName'])}`,
    showSidebar: false,
  })
}

@Component({ selector: 'test-layout-callback-static', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutCallbackStatic {
  static layout = () => ({ title: 'Static Callback Title', showSidebar: false })
}

@Component({ selector: 'test-layout-callback-function', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutCallbackFunction {
  static layout = () => ({
    title: 'Function Prop Title',
    showSidebar: false,
    formatName: (name: string) => `Hello, ${name}`,
  })
}

@Component({ selector: 'test-layout-callback-functions', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutCallbackFunctions {
  static layout = () => ({
    formatTitle: (name: string) => `Profile: ${name}`,
    formatDate: (date: string) => new Date(date).toLocaleDateString(),
  })
}

@Component({ selector: 'test-layout-callback-component', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutCallbackComponent {
  static layout = () => ({ title: 'Component Prop Title', component: 'UserCard', showSidebar: false })
}

@Component({ selector: 'test-layout-static-object', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutStaticObject {
  static layout = { title: 'Static Object Title', showSidebar: false }
}

@Component({ selector: 'test-layout-named-object', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutNamedObject {
  static layout = {
    app: { component: AppLayout, props: { title: 'Named Object Page', showSidebar: false, theme: 'dark' } },
    content: { component: ContentLayout, props: { padding: 'sm', maxWidth: '4xl' } },
  }
}

@Component({ selector: 'test-layout-named-dynamic', imports: [LayoutPropsBody], template: layoutPropsTemplate })
class LayoutNamedDynamic {
  static layout = {
    app: [AppLayout, { title: 'Named Dynamic Page' }],
    content: [ContentLayout, { padding: 'md' }],
  }
}

@Component({
  selector: 'test-persistent-body',
  imports: [Link],
  template: `
    <span class="text">{{ nested() ? 'Nested' : 'Simple' }} Persistent Layout - Page {{ pageLetter() }}</span>
    <a inertiaLink [href]="nextHref()">Page {{ pageLetter() === 'A' ? 'B' : 'A' }}</a>
  `,
})
class PersistentBody {
  readonly page = usePage()

  constructor() {
    afterNextRender(() => {
      window._inertia_page_props = this.page().props
    })
  }

  nested(): boolean {
    return this.page().component.includes('/Nested/')
  }

  pageLetter(): 'A' | 'B' {
    return this.page().component.endsWith('PageA') ? 'A' : 'B'
  }

  nextHref(): string {
    const path = this.page().url.split('?')[0]!
    return path.endsWith('page-a') ? path.replace(/page-a$/, 'page-b') : path.replace(/page-b$/, 'page-a')
  }
}

const persistentTemplate = '<test-persistent-body />'
const renderSimple: AngularRenderFunction = (h, page) => h(SiteLayout, page)
const renderNested: AngularRenderFunction = (h, page) => h(SiteLayout, h(NestedLayout, page))

@Component({ selector: 'test-persistent-shorthand-simple-a', imports: [PersistentBody], template: persistentTemplate })
class PersistentShorthandSimpleA {
  static layout = SiteLayout
}
@Component({ selector: 'test-persistent-shorthand-simple-b', imports: [PersistentBody], template: persistentTemplate })
class PersistentShorthandSimpleB {
  static layout = SiteLayout
}
@Component({ selector: 'test-persistent-shorthand-nested-a', imports: [PersistentBody], template: persistentTemplate })
class PersistentShorthandNestedA {
  static layout = [SiteLayout, NestedLayout]
}
@Component({ selector: 'test-persistent-shorthand-nested-b', imports: [PersistentBody], template: persistentTemplate })
class PersistentShorthandNestedB {
  static layout = [SiteLayout, NestedLayout]
}
@Component({ selector: 'test-persistent-render-simple-a', imports: [PersistentBody], template: persistentTemplate })
class PersistentRenderSimpleA {
  static layout = renderSimple
}
@Component({ selector: 'test-persistent-render-simple-b', imports: [PersistentBody], template: persistentTemplate })
class PersistentRenderSimpleB {
  static layout = renderSimple
}
@Component({ selector: 'test-persistent-render-nested-a', imports: [PersistentBody], template: persistentTemplate })
class PersistentRenderNestedA {
  static layout = renderNested
}
@Component({ selector: 'test-persistent-render-nested-b', imports: [PersistentBody], template: persistentTemplate })
class PersistentRenderNestedB {
  static layout = renderNested
}

@Component({
  selector: 'test-preserve-equal-props',
  imports: [Link],
  template: `
    <h1>Preserve Equal Props</h1>
    <p id="count-a">Count A: {{ nestedA().count }}</p>
    <p id="date-b">Date B: {{ nestedB().date }}</p>
    <p id="effect-a">Effect A Count: {{ effectACount() }}</p>
    <p id="effect-b">Effect B Count: {{ effectBCount() }}</p>
    <button inertiaLink method="post" href="/preserve-equal-props/back">Submit and redirect back</button>
  `,
})
class PreserveEqualProps {
  readonly nestedA = input.required<{ count: number }>()
  readonly nestedB = input.required<{ date: number }>()
  readonly effectACount = signal(0)
  readonly effectBCount = signal(0)
  #previousA: { count: number } | undefined
  #previousB: { date: number } | undefined

  constructor() {
    effect(() => {
      const value = this.nestedA()
      if (value !== this.#previousA) this.effectACount.update((count) => count + 1)
      this.#previousA = value
    })
    effect(() => {
      const value = this.nestedB()
      if (value !== this.#previousB) this.effectBCount.update((count) => count + 1)
      this.#previousB = value
    })
  }
}

export const layoutPages: Record<string, ResolvedComponent> = {
  'DefaultLayout/Index': DefaultLayoutIndex,
  'DefaultLayout/WithOwnLayout': DefaultLayoutOwn,
  'DefaultLayout/CallbackExcluded': DefaultLayoutExcluded,
  'LayoutProps/Basic': LayoutBasic as ResolvedComponent,
  'LayoutProps/Static': LayoutStatic as ResolvedComponent,
  'LayoutProps/Named': LayoutNamed as ResolvedComponent,
  'LayoutProps/Navigate': LayoutNavigate as ResolvedComponent,
  'LayoutProps/Nested': LayoutNested as ResolvedComponent,
  'LayoutProps/NamedStatic': LayoutNamedStatic as ResolvedComponent,
  'LayoutProps/Default': LayoutDefault,
  'LayoutProps/PersistentA': LayoutPersistentA as ResolvedComponent,
  'LayoutProps/PersistentB': LayoutPersistentB as ResolvedComponent,
  'LayoutProps/Callback': LayoutCallback as ResolvedComponent,
  'LayoutProps/CallbackDefault': LayoutCallbackDefault as ResolvedComponent,
  'LayoutProps/CallbackStatic': LayoutCallbackStatic as ResolvedComponent,
  'LayoutProps/CallbackFunctionProp': LayoutCallbackFunction as ResolvedComponent,
  'LayoutProps/CallbackAllFunctionProps': LayoutCallbackFunctions as ResolvedComponent,
  'LayoutProps/CallbackComponentProp': LayoutCallbackComponent as ResolvedComponent,
  'LayoutProps/StaticObject': LayoutStaticObject as ResolvedComponent,
  'LayoutProps/NamedObject': LayoutNamedObject as ResolvedComponent,
  'LayoutProps/NamedDynamic': LayoutNamedDynamic as ResolvedComponent,
  'PersistentLayouts/Shorthand/Simple/PageA': PersistentShorthandSimpleA,
  'PersistentLayouts/Shorthand/Simple/PageB': PersistentShorthandSimpleB,
  'PersistentLayouts/Shorthand/Nested/PageA': PersistentShorthandNestedA as ResolvedComponent,
  'PersistentLayouts/Shorthand/Nested/PageB': PersistentShorthandNestedB as ResolvedComponent,
  'PersistentLayouts/RenderFunction/Simple/PageA': PersistentRenderSimpleA as ResolvedComponent,
  'PersistentLayouts/RenderFunction/Simple/PageB': PersistentRenderSimpleB as ResolvedComponent,
  'PersistentLayouts/RenderFunction/Nested/PageA': PersistentRenderNestedA as ResolvedComponent,
  'PersistentLayouts/RenderFunction/Nested/PageB': PersistentRenderNestedB as ResolvedComponent,
  PreserveEqualProps,
}
