import { JsonPipe } from '@angular/common'
import { Component, DestroyRef, Directive, afterNextRender, inject, input, signal } from '@angular/core'
import { LayoutOutlet, Link, router, type ResolvedComponent } from '@inertiajs/angular'
import type { CacheForOption, Method, Page, RequestPayload, UrlMethodPair, VisitHelperOptions } from '@inertiajs/core'

const scrollLayoutTemplate = `
    <div style="width: 200vw">
      <span class="layout-text">{{ tracked ? 'With' : 'Without' }} scroll regions</span>
      <button type="button" (click)="updatePositions()">Update scroll positions</button>
      <div class="document-position">Document scroll position is {{ documentLeft() }} & {{ documentTop() }}</div>
      <div style="height: 200vh">
        <span class="slot-position">Slot scroll position is {{ slotLeft() }} & {{ slotTop() }}</span>
        <div id="slot" [attr.scroll-region]="tracked ? '' : null" style="height: 100px; width: 500px; overflow: scroll" (scroll)="updatePositions()">
          <inertia-layout-outlet />
        </div>
      </div>
    </div>
  `

@Directive()
abstract class ScrollLayoutBase {
  abstract readonly tracked: boolean
  readonly documentTop = signal(0)
  readonly documentLeft = signal(0)
  readonly slotTop = signal(0)
  readonly slotLeft = signal(0)

  constructor() {
    const destroyRef = inject(DestroyRef)
    afterNextRender(() => document.addEventListener('scroll', this.updatePositions))
    destroyRef.onDestroy(() => document.removeEventListener('scroll', this.updatePositions))
  }

  readonly updatePositions = (): void => {
    const slot = document.getElementById('slot')
    this.documentTop.set(document.documentElement.scrollTop)
    this.documentLeft.set(document.documentElement.scrollLeft)
    this.slotTop.set(slot?.scrollTop ?? 0)
    this.slotLeft.set(slot?.scrollLeft ?? 0)
  }
}

@Component({ selector: 'test-with-scroll-layout', imports: [LayoutOutlet], template: scrollLayoutTemplate })
export class WithScrollLayout extends ScrollLayoutBase {
  readonly tracked = true
}

@Component({ selector: 'test-without-scroll-layout', imports: [LayoutOutlet], template: scrollLayoutTemplate })
export class WithoutScrollLayout extends ScrollLayoutBase {
  readonly tracked = false
}

@Component({
  selector: 'test-links-method',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates inertia-link methods</span>
    <a inertiaLink method="get" href="/dump/get" class="get">GET Link</a>
    <button inertiaLink method="post" href="/dump/post" class="post">POST Link</button>
    <button inertiaLink method="put" href="/dump/put" class="put">PUT Link</button>
    <button inertiaLink method="patch" href="/dump/patch" class="patch">PATCH Link</button>
    <button inertiaLink method="delete" href="/dump/delete" class="delete">DELETE Link</button>
    <button inertiaLink [href]="postHref">OBJECT Link</button>
    <button inertiaLink [href]="postHref" method="put">OBJECT METHOD OVERRIDE Link</button>
  `,
})
class LinksMethod {
  readonly postHref: UrlMethodPair = { url: '/dump/post', method: 'post' }
}

@Component({
  selector: 'test-links-location',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates location visits inertia-links</span>
    <a inertiaLink href="/location" [replace]="true" class="example">Location visit</a>
  `,
})
class LinksLocation {}

@Component({
  selector: 'test-links-automatic-cancellation',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
    <a inertiaLink href="/sleep" class="visit" (cancel)="log('cancelled')" (start)="log('started')">Link</a>
  `,
})
class LinksAutomaticCancellation {
  log(message: string): void {
    console.log(message)
  }
}

@Component({
  selector: 'test-links-data-object',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates passing data through plain objects</span>
    <a inertiaLink href="/dump/get" [data]="{ foo: 'get' }" class="get">GET Link</a>
    <button inertiaLink method="post" href="/dump/post" [data]="{ bar: 'post' }" class="post">POST Link</button>
    <button inertiaLink method="put" href="/dump/put" [data]="{ baz: 'put' }" class="put">PUT Link</button>
    <button inertiaLink method="patch" href="/dump/patch" [data]="{ foo: 'patch' }" class="patch">PATCH Link</button>
    <button inertiaLink method="delete" href="/dump/delete" [data]="{ bar: 'delete' }" class="delete">
      DELETE Link
    </button>
    <a inertiaLink href="/dump/get" [data]="arrayData" class="qsaf-default">QSAF Default</a>
    <a inertiaLink href="/dump/get" [data]="arrayData" queryStringArrayFormat="indices" class="qsaf-indices"
      >QSAF Indices</a
    >
    <a inertiaLink href="/dump/get" [data]="arrayData" queryStringArrayFormat="brackets" class="qsaf-brackets"
      >QSAF Brackets</a
    >
  `,
})
class LinksDataObject {
  readonly arrayData = { a: ['b', 'c'] }
}

@Component({
  selector: 'test-links-data-form-data',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates passing data through FormData objects</span>
    <a inertiaLink href="/dump/get" [data]="linkData" class="get">GET Link</a>
    <button inertiaLink method="post" href="/dump/post" [data]="linkData" class="post">POST Link</button>
    <button inertiaLink method="put" href="/dump/put" [data]="linkData" class="put">PUT Link</button>
    <button inertiaLink method="patch" href="/dump/patch" [data]="linkData" class="patch">PATCH Link</button>
    <button inertiaLink method="delete" href="/dump/delete" [data]="linkData" class="delete">DELETE Link</button>
  `,
})
class LinksDataFormData {
  readonly linkData = new FormData()

  constructor() {
    this.linkData.append('bar', 'baz')
  }
}

@Component({
  selector: 'test-links-data-auto-converted',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates automatic conversion to form-data</span>
    <a inertiaLink href="/dump/get" [data]="linkData" class="get">GET Link</a>
    <button inertiaLink method="post" href="/dump/post" [data]="linkData" class="post">POST Link</button>
    <button inertiaLink method="put" href="/dump/put" [data]="linkData" class="put">PUT Link</button>
    <button inertiaLink method="patch" href="/dump/patch" [data]="linkData" class="patch">PATCH Link</button>
    <button inertiaLink method="delete" href="/dump/delete" [data]="linkData" class="delete">DELETE Link</button>
  `,
})
class LinksDataAutoConverted {
  readonly linkData = { file: new File([], 'example.jpg'), foo: 'bar' }
}

@Component({
  selector: 'test-links-headers',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates passing custom headers</span>
    <a inertiaLink href="/dump/get" class="default">Standard visit Link</a>
    <a inertiaLink href="/dump/get" [headers]="{ foo: 'bar' }" class="custom">GET Link</a>
    <button
      inertiaLink
      method="post"
      href="/dump/post"
      [headers]="{ bar: 'baz', 'X-Requested-With': 'custom' }"
      class="overridden"
    >
      POST Link
    </button>
  `,
})
class LinksHeaders {}

@Component({
  selector: 'test-links-replace',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates replace on Links</span>
    <a inertiaLink href="/dump/get" [replace]="true">[State] Replace: true</a>
    <a inertiaLink href="/dump/get" [replace]="false">[State] Replace: false</a>
  `,
})
class LinksReplace {}

@Component({
  selector: 'test-links-preserve-state',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates preserve state on Links</span>
    <span class="foo">Foo is now {{ foo() }}</span>
    <label>Example Field <input type="text" name="example-field" class="field" /></label>
    <a inertiaLink href="/links/preserve-state-page-two" [preserveState]="true" [data]="{ foo: 'bar' }"
      >[State] Preserve: true</a
    >
    <a inertiaLink href="/links/preserve-state-page-two" [preserveState]="false" [data]="{ foo: 'baz' }"
      >[State] Preserve: false</a
    >
    <a inertiaLink href="/links/preserve-state-page-two" [preserveState]="preserve" [data]="{ foo: 'callback-bar' }"
      >[State] Preserve Callback: true</a
    >
    <a inertiaLink href="/links/preserve-state-page-two" [preserveState]="dontPreserve" [data]="{ foo: 'callback-baz' }"
      >[State] Preserve Callback: false</a
    >
  `,
})
class LinksPreserveState {
  static layout = WithoutScrollLayout
  readonly foo = input('default')
  readonly id = crypto.randomUUID()

  constructor() {
    afterNextRender(() => {
      window._inertia_page_key = this.id
    })
  }

  readonly preserve = (page: Page): boolean => {
    window.alert(String(page))
    return true
  }

  readonly dontPreserve = (page: Page): boolean => {
    window.alert(String(page))
    return false
  }
}

type PreserveUrlItems = { data: string[]; next_page_url?: string }

@Component({
  selector: 'test-links-preserve-url',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates preserve url on Links</span>
    <span class="foo">Foo is now {{ foo() || 'default' }}</span>
    <a inertiaLink href="/links/preserve-url-page-two" [preserveUrl]="true" [data]="{ foo: 'bar' }"
      >[URL] Preserve: true</a
    >
    <a inertiaLink href="/links/preserve-url-page-two" [preserveUrl]="false" [data]="{ foo: 'baz' }"
      >[URL] Preserve: false</a
    >
    @if (items(); as currentItems) {
      <div class="items-section">
        <div class="items">
          @for (item of currentItems.data; track item) {
            <div class="item">{{ item }}</div>
          }
        </div>
        <span class="items-loaded">Items loaded: {{ currentItems.data.length }}</span>
        <span class="has-next-page">{{ currentItems.next_page_url ? 'true' : 'false' }}</span>
        @if (currentItems.next_page_url; as nextUrl) {
          <a
            inertiaLink
            [href]="nextUrl"
            [only]="['items']"
            [preserveState]="true"
            [preserveScroll]="true"
            [preserveUrl]="true"
            >Load More</a
          >
          <button type="button" (click)="loadMore(nextUrl)">Load More Router</button>
        }
      </div>
    }
  `,
})
class LinksPreserveUrl {
  readonly foo = input<string>()
  readonly items = input<PreserveUrlItems>()

  loadMore(url: string): void {
    router.visit(url, { only: ['items'], preserveState: true, preserveScroll: true, preserveUrl: true })
  }
}

@Directive()
abstract class PreserveScrollBase {
  readonly foo = input('default')
  abstract readonly target: string
  abstract readonly tracked: boolean

  readonly preserve = (page: Page): boolean => {
    console.log(JSON.stringify(page))
    return true
  }

  readonly dontPreserve = (page: Page): boolean => {
    console.log(JSON.stringify(page))
    return false
  }
}

const preserveScrollTemplate = `
  <div style="height: 800px; width: 600px">
    <span class="text">This is the links page that demonstrates scroll preservation {{ tracked ? 'with' : 'without' }} scroll regions</span>
    <span class="foo">Foo is now {{ foo() }}</span>
    <a style="display: block" inertiaLink [href]="target" [preserveScroll]="true" [data]="{ foo: 'baz' }" data-testid="preserve">Preserve Scroll</a>
    <a style="display: block" inertiaLink [href]="target" [data]="{ foo: 'bar' }" data-testid="reset">Reset Scroll</a>
    <a style="display: block" inertiaLink [href]="target" [preserveScroll]="preserve" [data]="{ foo: 'baz' }" data-testid="preserve-callback">Preserve Scroll (Callback)</a>
    <a style="display: block" inertiaLink [href]="target" [preserveScroll]="dontPreserve" [data]="{ foo: 'foo' }" data-testid="reset-callback">Reset Scroll (Callback)</a>
    <a href="/non-inertia" class="off-site" style="display: block">Off-site link</a>
    @if (tracked) { <a inertiaLink href="/article" data-testid="article">Article</a> }
  </div>
`

@Component({ selector: 'test-links-preserve-scroll', imports: [Link], template: preserveScrollTemplate })
class LinksPreserveScroll extends PreserveScrollBase {
  static layout = WithScrollLayout
  readonly target = '/links/preserve-scroll-page-two'
  readonly tracked = true
}

@Component({ selector: 'test-links-preserve-scroll-false', imports: [Link], template: preserveScrollTemplate })
class LinksPreserveScrollFalse extends PreserveScrollBase {
  static layout = WithoutScrollLayout
  readonly target = '/links/preserve-scroll-false-page-two'
  readonly tracked = false
}

@Component({
  selector: 'test-links-partial-reloads',
  imports: [JsonPipe, Link],
  template: `
    <span class="text">This is the links page that demonstrates partial reloads</span>
    <span class="foo-text">Foo is now {{ foo() }}</span
    ><span class="bar-text">Bar is now {{ bar() }}</span
    ><span class="baz-text">Baz is now {{ baz() }}</span>
    <pre class="headers">{{ headers() | json }}</pre>
    <a inertiaLink href="/links/partial-reloads" [data]="{ foo: foo() }">Update All</a>
    <a inertiaLink href="/links/partial-reloads" [only]="['headers', 'foo', 'bar']" [data]="{ foo: foo() }"
      >Only foo + bar</a
    >
    <a inertiaLink href="/links/partial-reloads" [only]="['headers', 'baz']" [data]="{ foo: foo() }">Only baz</a>
    <a inertiaLink href="/links/partial-reloads" [except]="['foo', 'bar']" [data]="{ foo: foo() }">Except foo + bar</a>
    <a inertiaLink href="/links/partial-reloads" [except]="['baz']" [data]="{ foo: foo() }">Except baz</a>
  `,
})
class LinksPartialReloads {
  readonly foo = input(0)
  readonly bar = input<number>()
  readonly baz = input<number>()
  readonly headers = input<Record<string, string>>({})
}

@Component({
  selector: 'test-links-url-fragments',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates url fragment behaviour</span>
    <div style="width: 200vw; height: 200vh; margin-top: 50vh">
      <button type="button" (click)="updatePosition()">Update scroll positions</button>
      <div class="document-position">Document scroll position is {{ left() }} & {{ top() }}</div>
      <a inertiaLink href="/links/url-fragments#target" class="basic">Basic link</a>
      <a inertiaLink href="#target" class="fragment">Fragment link</a>
      <a inertiaLink href="/links/url-fragments#non-existent-fragment" class="non-existent-fragment"
        >Non-existent fragment link</a
      >
      <div id="target">This is the element with id 'target'</div>
    </div>
  `,
})
class LinksUrlFragments {
  readonly top = signal(0)
  readonly left = signal(0)

  constructor() {
    const destroyRef = inject(DestroyRef)
    afterNextRender(() => document.addEventListener('scroll', this.updatePosition))
    destroyRef.onDestroy(() => document.removeEventListener('scroll', this.updatePosition))
  }

  readonly updatePosition = (): void => {
    this.top.set(document.documentElement.scrollTop)
    this.left.set(document.documentElement.scrollLeft)
  }
}

@Component({
  selector: 'test-links-scroll-region-list',
  template: `
    <span class="text">Scrollable list with scroll region</span>
    <div class="user-text">Clicked user: {{ userId() || 'none' }}</div>
    @for (user of users; track user.id) {
      <div style="padding: 20px; border-bottom: 1px solid #ccc">
        <div style="margin-bottom: 10px; width: 500px">{{ user.name }}</div>
        <button type="button" (click)="navigate(user.id)">Default</button>
        <button type="button" (click)="navigate(user.id, { preserveScroll: true })">Preserve True</button>
        <button type="button" (click)="navigate(user.id, { preserveScroll: false })">Preserve False</button>
      </div>
    }
  `,
})
class LinksScrollRegionList {
  static layout = WithScrollLayout
  readonly userId = input(0, { alias: 'user_id' })
  readonly users = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, name: `User ${index + 1}` }))

  navigate(id: number, options: VisitHelperOptions = {}): void {
    router.get(`/links/scroll-region-list/user/${id}`, {}, options)
  }
}

@Component({
  selector: 'test-links-warning',
  imports: [Link],
  template: `
    <span class="text">This is the links page that demonstrates semantic link elements</span>
    @if (method() === 'get') {
      <a inertiaLink [method]="method()" href="/example">GET Link</a>
    } @else {
      <button inertiaLink [method]="method()" href="/example">{{ method().toUpperCase() }} Link</button>
    }
  `,
})
class LinksWarning {
  readonly method = input<Method>('get')
}

@Component({
  selector: 'test-links-warning-false',
  imports: [Link],
  template: '<button inertiaLink [method]="method()" href="/example">{{ method().toUpperCase() }} button Link</button>',
})
class LinksWarningFalse {
  readonly method = input<Method>('get')
}

@Directive()
abstract class LinksCustomBase {
  readonly page = input(0)
  readonly state = crypto.randomUUID()

  constructor() {
    window.componentEvents = []
  }

  track(eventName: string, data: unknown = null): void {
    window.componentEvents.push({ eventName, data, timestamp: Date.now() })
  }
}

const customComponentTemplate = `
  <h1>Link Custom Component - Page {{ page() }}</h1>
  <p id="state">State: {{ state }}</p>
  <button inertiaLink href="/dump/get" class="get" style="background-color: blue; color: white; padding: 10px">GET Custom Component</button>
  <button inertiaLink method="post" href="/dump/post" class="post">POST Custom Component</button>
  <button inertiaLink method="post" href="/dump/post" [data]="{ test: 'data' }" class="data">Custom Component with Data</button>
  <button inertiaLink href="/dump/get" [headers]="{ 'X-Test': 'header' }" class="headers">Custom Component with Headers</button>
  <button inertiaLink href="/links/as-component/2" [preserveState]="true" class="preserve">Custom Component with Preserve State</button>
  <button inertiaLink href="/links/as-component/3" [replace]="true" class="replace">Custom Component with Replace</button>
  <button inertiaLink href="/dump/get" (start)="track('onStart', $event)" (success)="track('onSuccess', $event)" (finish)="track('onFinish', $event)" class="events">Custom Component with Events</button>
`

const customElementTemplate = `
  <h1>Link Custom Element - Page {{ page() }}</h1>
  <p id="state">State: {{ state }}</p>
  <div inertiaLink href="/dump/get" class="get" style="background-color: blue; color: white; padding: 10px">GET Custom Element</div>
  <div inertiaLink method="post" href="/dump/post" class="post">POST Custom Element</div>
  <div inertiaLink method="post" href="/dump/post" [data]="{ test: 'data' }" class="data">Custom Element with Data</div>
  <div inertiaLink href="/dump/get" [headers]="{ 'X-Test': 'header' }" class="headers">Custom Element with Headers</div>
  <div inertiaLink href="/links/as-element/2" [preserveState]="true" class="preserve">Custom Element with Preserve State</div>
  <div inertiaLink href="/links/as-element/3" [replace]="true" class="replace">Custom Element with Replace</div>
  <div inertiaLink href="/dump/get" (start)="track('onStart', $event)" (success)="track('onSuccess', $event)" (finish)="track('onFinish', $event)" class="events">Custom Element with Events</div>
`

@Component({ selector: 'test-links-custom-component', imports: [Link], template: customComponentTemplate })
class LinksCustomComponent extends LinksCustomBase {}

@Component({ selector: 'test-links-custom-element', imports: [Link], template: customElementTemplate })
class LinksCustomElement extends LinksCustomBase {}

@Component({
  selector: 'test-links-data-loading',
  imports: [Link],
  template: '<a inertiaLink href="/sleep">First</a><a inertiaLink href="/sleep">Second</a>',
})
class LinksDataLoading {}

@Component({
  selector: 'test-links-cancel-sync',
  imports: [Link],
  template: `
    <h1 style="font-size: 40px">Page {{ page() }}</h1>
    <a inertiaLink href="/links/cancel-sync-request/1">Go to Page 1</a>
    <a inertiaLink href="/links/cancel-sync-request/2">Go to Page 2</a>
    <a inertiaLink href="/links/cancel-sync-request/3">Go to Page 3</a>
  `,
})
class LinksCancelSync {
  readonly page = input(0)
}

@Component({
  selector: 'test-links-prop-update',
  imports: [Link],
  template:
    '<button type="button" (click)="href.set(\'/something-else\')">Change URL</button><a inertiaLink [href]="href()">The Link</a>',
})
class LinksPropUpdate {
  readonly href = signal('/sleep')
}

@Component({
  selector: 'test-links-reactivity',
  imports: [Link],
  template: `
    <span class="text">This page demonstrates reactivity in Inertia links.</span>
    @if (method() === 'get') {
      <a inertiaLink [method]="method()" [href]="href()" [data]="data()" [headers]="headers()">Submit</a>
    } @else {
      <button inertiaLink [method]="method()" [href]="href()" [data]="data()" [headers]="headers()">Submit</button>
    }
    <button type="button" (click)="change()">Change Link Props</button>
    <a inertiaLink href="/dump/get" [prefetch]="prefetch()" [cacheFor]="cacheFor()">Prefetch Link</a>
    <button type="button" (click)="enablePrefetch()">Enable Prefetch (1s cache)</button>
  `,
})
class LinksReactivity {
  readonly method = signal<Method>('get')
  readonly href = signal('/dump/get')
  readonly data = signal<RequestPayload>({ foo: 'bar' })
  readonly headers = signal({ 'X-Custom-Header': 'value' })
  readonly prefetch = signal<false | 'hover'>(false)
  readonly cacheFor = signal<CacheForOption>(0)

  change(): void {
    this.method.set('post')
    this.href.set('/dump/post')
    this.data.set({ foo: 'baz' })
    this.headers.set({ 'X-Custom-Header': 'new-value' })
  }

  enablePrefetch(): void {
    this.prefetch.set('hover')
    this.cacheFor.set('1s')
  }
}

@Component({
  selector: 'test-links-path-traversal',
  imports: [Link],
  template:
    '<a inertiaLink href="../">Up one level</a><a inertiaLink href="../../method">Up two levels and open method</a><a inertiaLink href="../../../">Up three levels</a>',
})
class LinksPathTraversal {}

@Component({
  selector: 'test-article',
  imports: [Link],
  template: `
    <h1 style="font-size: 40px">Article Header</h1>
    <article style="font-size: 20px; max-width: 500px">
      <div style="height: 1400px">Article content</div>
      <h2 id="far-down">Far down</h2>
    </article>
    <div class="document-position">Scroll log: {{ jsonLog() }}</div>
    <a inertiaLink id="home" data-testid="home" href="/">Home</a>
    <a inertiaLink id="article-far-down" href="/article#far-down">Article Far Down</a>
    <button type="button" (click)="enableSmoothScroll()">Enable Smooth Scroll</button>
    <button type="button" (click)="scrollLog.set([])">Clear Scroll Log</button>
  `,
})
class Article {
  readonly scrollLog = signal<number[]>([])

  constructor() {
    const destroyRef = inject(DestroyRef)
    const listener = (): void => this.scrollLog.update((log) => [...log, document.documentElement.scrollTop])
    afterNextRender(() => document.addEventListener('scroll', listener))
    destroyRef.onDestroy(() => document.removeEventListener('scroll', listener))
  }

  jsonLog(): string {
    return JSON.stringify(this.scrollLog())
  }

  enableSmoothScroll(): void {
    document.documentElement.style.scrollBehavior = 'smooth'
  }
}

let originalScrollTo: typeof window.scrollTo | null = null

@Component({
  selector: 'test-scroll-after-render',
  imports: [Link],
  template: `
    <h1 style="font-size: 40px">Article Header</h1>
    <h2 style="font-size: 40px">Page {{ page() }}</h2>
    <a
      inertiaLink
      [href]="'/scroll-after-render/' + (page() + 1)"
      style="display: block; margin-top: 20px"
      (before)="beforeNavigate()"
      >Go to page {{ page() + 1 }}</a
    >
    <div style="height: 10000px">Scrollable content</div>
  `,
})
class ScrollAfterRender {
  readonly page = input(0)

  constructor() {
    if (!originalScrollTo) {
      originalScrollTo = window.scrollTo.bind(window)
      window.scrollTo = ((xOrOptions: number | ScrollToOptions, y?: number) => {
        const firstArgIsNumber = typeof xOrOptions === 'number'
        console.log('ScrollY', firstArgIsNumber ? y : (xOrOptions.top ?? 0))
        if (firstArgIsNumber) originalScrollTo!(xOrOptions, y!)
        else originalScrollTo!(xOrOptions)
      }) as typeof window.scrollTo
    } else {
      console.log('Render')
    }
  }

  beforeNavigate(): void {
    window.scrollTo(0, 100)
  }
}

@Component({
  selector: 'test-scroll-region-preserve-url',
  template: `
    <div scroll-region id="scroll-container" style="height: 300px; overflow-y: auto; border: 1px solid #ccc">
      <div class="page-number">Page: {{ page() }}</div>
      <button id="scroll-and-navigate" type="button" (click)="start()">Start scrolling and navigate</button>
      @for (item of items; track item) {
        <div style="padding: 20px; border-bottom: 1px solid #eee">Item {{ item }}</div>
      }
    </div>
  `,
})
class ScrollRegionPreserveUrl {
  readonly page = input(1)
  readonly items = Array.from({ length: 50 }, (_, index) => index + 1)
  #interval: ReturnType<typeof setInterval> | undefined

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.#interval))
  }

  start(): void {
    const container = document.getElementById('scroll-container')!
    this.#interval = setInterval(() => (container.scrollTop += 10), 10)
    setTimeout(() => {
      router.visit(`/scroll-region-preserve-url/${this.page() === 1 ? 2 : 1}`, {
        preserveScroll: true,
        preserveState: true,
        preserveUrl: true,
        onSuccess: () => clearInterval(this.#interval),
      })
    }, 150)
  }
}

export const linkPages: Record<string, ResolvedComponent> = {
  'Links/Method': LinksMethod,
  'Links/Location': LinksLocation,
  'Links/AutomaticCancellation': LinksAutomaticCancellation,
  'Links/Data/Object': LinksDataObject,
  'Links/Data/FormData': LinksDataFormData,
  'Links/Data/AutoConverted': LinksDataAutoConverted,
  'Links/Headers': LinksHeaders,
  'Links/Replace': LinksReplace,
  'Links/PreserveState': LinksPreserveState,
  'Links/PreserveUrl': LinksPreserveUrl,
  'Links/PreserveScroll': LinksPreserveScroll,
  'Links/PreserveScrollFalse': LinksPreserveScrollFalse,
  'Links/PartialReloads': LinksPartialReloads,
  'Links/UrlFragments': LinksUrlFragments,
  'Links/ScrollRegionList': LinksScrollRegionList,
  'Links/AsWarning': LinksWarning,
  'Links/AsWarningFalse': LinksWarningFalse,
  'Links/AsComponent': LinksCustomComponent,
  'Links/AsElement': LinksCustomElement,
  'Links/DataLoading': LinksDataLoading,
  'Links/CancelSyncRequest': LinksCancelSync,
  'Links/PropUpdate': LinksPropUpdate,
  'Links/Reactivity': LinksReactivity,
  'Links/PathTraversal': LinksPathTraversal,
  Article,
  ScrollAfterRender,
  ScrollRegionPreserveUrl,
}
