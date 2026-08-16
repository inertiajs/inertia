import { Component, DestroyRef, Directive, afterNextRender, inject, input, signal } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  Link,
  http,
  router,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'
import type { Page } from '@inertiajs/core'
import { WithScrollLayout, WithoutScrollLayout } from './link-pages'

@Component({
  selector: 'test-visits-method',
  template: `
    <span class="text">This is the page that demonstrates manual visit methods</span>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/get')">Standard visit Link</a>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/patch', { method: 'patch' })">Specific visit Link</a>
    <a href="#" (click)="$event.preventDefault(); router.get('/dump/get')">GET Link</a>
    <a href="#" (click)="$event.preventDefault(); router.post('/dump/post')">POST Link</a>
    <a href="#" (click)="$event.preventDefault(); router.put('/dump/put')">PUT Link</a>
    <a href="#" (click)="$event.preventDefault(); router.patch('/dump/patch')">PATCH Link</a>
    <a href="#" (click)="$event.preventDefault(); router.delete('/dump/delete')">DELETE Link</a>
  `,
})
class VisitsMethod {
  readonly router = router
}

@Component({
  selector: 'test-visits-location',
  template:
    '<span class="text">This is the page that demonstrates location visits</span><a href="#" (click)="$event.preventDefault(); router.visit(\'/location\')">Location visit</a>',
})
class VisitsLocation {
  readonly router = router
}

@Component({
  selector: 'test-visits-automatic-cancellation',
  template:
    '<span class="text">This is the page that demonstrates that only one visit can be active at a time</span><a href="#" (click)="$event.preventDefault(); visit()">Link</a>',
})
class VisitsAutomaticCancellation {
  visit(): void {
    router.get('/sleep', {}, { onStart: () => console.log('started'), onCancel: () => console.log('cancelled') })
  }
}

@Component({
  selector: 'test-visits-data-object',
  template: `
    <span class="text">This is the page that demonstrates manual visit data passing through plain objects</span>
    <a href="#" (click)="$event.preventDefault(); visit()">Visit Link</a>
    <a href="#" (click)="$event.preventDefault(); router.get('/dump/get', { bar: 'get' })">GET Link</a>
    <a href="#" (click)="$event.preventDefault(); router.post('/dump/post', { baz: 'post' })">POST Link</a>
    <a href="#" (click)="$event.preventDefault(); router.put('/dump/put', { foo: 'put' })">PUT Link</a>
    <a href="#" (click)="$event.preventDefault(); router.patch('/dump/patch', { bar: 'patch' })">PATCH Link</a>
    <a href="#" (click)="$event.preventDefault(); router.delete('/dump/delete', { data: { baz: 'delete' } })">DELETE Link</a>
    <a href="#" (click)="$event.preventDefault(); qsaf('brackets')">QSAF Defaults</a>
    <a href="#" (click)="$event.preventDefault(); qsaf('indices')">QSAF Indices</a>
    <a href="#" (click)="$event.preventDefault(); qsaf('brackets')">QSAF Brackets</a>
    <a href="#" (click)="$event.preventDefault(); deleteQueryParam()">Delete Query Param</a>
  `,
})
class VisitsDataObject {
  readonly router = router

  visit(): void {
    router.visit('/dump/get', { data: { foo: 'visit' } })
  }

  qsaf(format: 'indices' | 'brackets'): void {
    router.visit('/dump/get', { data: { a: ['b', 'c'] }, queryStringArrayFormat: format })
  }

  deleteQueryParam(): void {
    router.visit('/dump/get', { data: { a: undefined } })
  }
}

@Component({
  selector: 'test-visits-data-form-data',
  template: `
    <span class="text">This is the page that demonstrates manual visit data passing through FormData objects</span>
    <a href="#" (click)="$event.preventDefault(); send('visit')">Visit Link</a>
    <a href="#" (click)="$event.preventDefault(); send('post')">POST Link</a>
    <a href="#" (click)="$event.preventDefault(); send('put')">PUT Link</a>
    <a href="#" (click)="$event.preventDefault(); send('patch')">PATCH Link</a>
    <a href="#" (click)="$event.preventDefault(); send('delete')">DELETE Link</a>
  `,
})
class VisitsDataFormData {
  send(method: 'visit' | 'post' | 'put' | 'patch' | 'delete'): void {
    const data = new FormData()
    const fields = {
      visit: ['foo', 'visit'],
      post: ['baz', 'post'],
      put: ['foo', 'put'],
      patch: ['bar', 'patch'],
      delete: ['baz', 'delete'],
    } as const
    const [field, value] = fields[method]
    data.append(field, value)
    if (method === 'visit') router.visit('/dump/post', { method: 'post', data })
    else if (method === 'delete') router.delete('/dump/delete', { data })
    else router[method](`/dump/${method}`, data)
  }
}

@Component({
  selector: 'test-visits-data-auto-converted',
  template: `
    <span class="text">This is the page that demonstrates automatic conversion to form-data using manual visits</span>
    <a href="#" (click)="$event.preventDefault(); send('visit')">Visit Link</a>
    <a href="#" (click)="$event.preventDefault(); send('post')">POST Link</a>
    <a href="#" (click)="$event.preventDefault(); send('put')">PUT Link</a>
    <a href="#" (click)="$event.preventDefault(); send('patch')">PATCH Link</a>
    <a href="#" (click)="$event.preventDefault(); send('delete')">DELETE Link</a>
  `,
})
class VisitsDataAutoConverted {
  readonly data = { file: new File([], 'example.jpg'), foo: 'bar' }

  send(method: 'visit' | 'post' | 'put' | 'patch' | 'delete'): void {
    if (method === 'visit') router.visit('/dump/post', { method: 'post', data: this.data })
    else if (method === 'delete') router.delete('/dump/delete', { data: this.data })
    else router[method](`/dump/${method}`, this.data)
  }
}

@Component({
  selector: 'test-visits-headers',
  template: `
    <span class="text">This is the page that demonstrates passing custom headers through manual visits</span>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/get')">Standard visit Link</a>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/get', { headers: { foo: 'bar' } })">Specific visit Link</a>
    <a href="#" (click)="$event.preventDefault(); router.get('/dump/get', {}, { headers: { bar: 'baz' } })">GET Link</a>
    <a href="#" (click)="$event.preventDefault(); router.post('/dump/post', {}, { headers: { baz: 'foo' } })">POST Link</a>
    <a href="#" (click)="$event.preventDefault(); router.put('/dump/put', {}, { headers: { foo: 'bar' } })">PUT Link</a>
    <a href="#" (click)="$event.preventDefault(); router.patch('/dump/patch', {}, { headers: { bar: 'baz' } })">PATCH Link</a>
    <a href="#" (click)="$event.preventDefault(); router.delete('/dump/delete', { headers: { baz: 'foo' } })">DELETE Link</a>
    <a href="#" (click)="$event.preventDefault(); router.post('/dump/post', {}, { headers: { bar: 'baz', 'X-Requested-With': 'custom' } })">Overriden Link</a>
  `,
})
class VisitsHeaders {
  readonly router = router
}

@Component({
  selector: 'test-visits-error-bags',
  template: `
    <span class="text">This is the page that demonstrates error bags using manual visits</span>
    <a href="#" (click)="$event.preventDefault(); router.post('/dump/post')">Default visit</a>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/post', { method: 'post', data: { foo: 'bar' }, errorBag: 'visitErrorBag' })">Basic visit</a>
    <a href="#" (click)="$event.preventDefault(); router.post('/dump/post', { foo: 'baz' }, { errorBag: 'postErrorBag' })">POST visit</a>
  `,
})
class VisitsErrorBags {
  readonly router = router
}

@Component({
  selector: 'test-visits-replace',
  template: `
    <span class="text">This is the links page that demonstrates manual replace</span>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/get', { replace: true })">[State] Replace visit: true</a>
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/get', { replace: false })">[State] Replace visit: false</a>
    <a href="#" (click)="$event.preventDefault(); router.get('/dump/get', {}, { replace: true })">[State] Replace GET: true</a>
    <a href="#" (click)="$event.preventDefault(); router.get('/dump/get', {}, { replace: false })">[State] Replace GET: false</a>
  `,
})
class VisitsReplace {
  readonly router = router
}

@Component({
  selector: 'test-visits-preserve-state',
  template: `
    <span class="text">This is the page that demonstrates preserve state on manual visits</span>
    <span class="foo">Foo is now {{ foo() }}</span>
    <label>Example Field <input type="text" name="example-field" class="field" /></label>
    <a href="#" (click)="$event.preventDefault(); visit('bar', true)">[State] Preserve visit: true</a>
    <a href="#" (click)="$event.preventDefault(); visit('baz', false)">[State] Preserve visit: false</a>
    <a href="#" (click)="$event.preventDefault(); get('callback-bar', preserve)">[State] Preserve Callback: true</a>
    <a href="#" (click)="$event.preventDefault(); get('callback-baz', dontPreserve)"
      >[State] Preserve Callback: false</a
    >
    <a href="#" (click)="$event.preventDefault(); get('get-bar', true)">[State] Preserve GET: true</a>
    <a href="#" (click)="$event.preventDefault(); get('get-baz', false)">[State] Preserve GET: false</a>
  `,
})
class VisitsPreserveState {
  readonly foo = input('default')
  readonly id = crypto.randomUUID()

  constructor() {
    afterNextRender(() => (window._inertia_page_key = this.id))
  }

  readonly preserve = (page: Page): boolean => {
    window.alert(String(page))
    return true
  }
  readonly dontPreserve = (page: Page): boolean => {
    window.alert(String(page))
    return false
  }

  visit(foo: string, preserveState: boolean): void {
    router.visit('/visits/preserve-state-page-two', { data: { foo }, preserveState })
  }

  get(foo: string, preserveState: boolean | ((page: Page) => boolean)): void {
    router.get('/visits/preserve-state-page-two', { foo }, { preserveState })
  }
}

@Directive()
abstract class VisitsPreserveScrollBase {
  readonly foo = input('default')
  abstract readonly target: string

  visit(foo: string, preserveScroll: boolean | ((page: Page) => boolean) = false): void {
    router.visit(this.target, { data: { foo }, preserveScroll })
  }

  get(foo: string, preserveScroll: boolean): void {
    router.get(this.target, { foo }, { preserveScroll })
  }

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
    <span class="text">This is the page that demonstrates scroll preservation when using manual visits</span>
    <span class="foo">Foo is now {{ foo() }}</span>
    <a href="#" (click)="$event.preventDefault(); visit('foo', true)">Preserve Scroll</a>
    <a href="#" (click)="$event.preventDefault(); visit('bar')">Reset Scroll</a>
    <a href="#" (click)="$event.preventDefault(); visit('baz', preserve)">Preserve Scroll (Callback)</a>
    <br />
    <a href="#" (click)="$event.preventDefault(); visit('foo', dontPreserve)">Reset Scroll (Callback)</a>
    <a href="#" (click)="$event.preventDefault(); get('bar', true)">Preserve Scroll (GET)</a>
    <a href="#" (click)="$event.preventDefault(); get('baz', false)">Reset Scroll (GET)</a>
    <a href="/non-inertia" class="off-site">Off-site link</a>
  </div>
`

@Component({ selector: 'test-visits-preserve-scroll', template: preserveScrollTemplate })
class VisitsPreserveScroll extends VisitsPreserveScrollBase {
  static layout = WithScrollLayout
  readonly target = '/visits/preserve-scroll-page-two'
}

@Component({ selector: 'test-visits-preserve-scroll-false', template: preserveScrollTemplate })
class VisitsPreserveScrollFalse extends VisitsPreserveScrollBase {
  static layout = WithoutScrollLayout
  readonly target = '/visits/preserve-scroll-false-page-two'
}

@Component({
  selector: 'test-visits-partial-reloads',
  template: `
    <span class="text">This is the page that demonstrates partial reloads using manual visits</span>
    <span class="foo-text">Foo is now {{ foo() }}</span><span class="bar-text">Bar is now {{ bar() }}</span><span class="baz-text">Baz is now {{ baz() }}</span>
    <a href="#" (click)="$event.preventDefault(); visit()">Update All (visit)</a>
    <a href="#" (click)="$event.preventDefault(); visit(['headers', 'foo', 'bar'])">'Only' foo + bar (visit)</a>
    <a href="#" (click)="$event.preventDefault(); visit(['headers', 'baz'])">'Only' baz (visit)</a>
    <a href="#" (click)="$event.preventDefault(); visit([], ['foo', 'bar'])">'Except' foo + bar (visit)</a>
    <a href="#" (click)="$event.preventDefault(); visit([], ['baz'])">'Except' baz (visit)</a>
    <a href="#" (click)="$event.preventDefault(); get()">Update All (GET)</a>
    <a href="#" (click)="$event.preventDefault(); get(['headers', 'foo', 'bar'])">'Only' foo + bar (GET)</a>
    <a href="#" (click)="$event.preventDefault(); get(['headers', 'baz'])">'Only' baz (GET)</a>
    <a href="#" (click)="$event.preventDefault(); get([], ['foo', 'bar'])">'Except' foo + bar (GET)</a>
    <a href="#" (click)="$event.preventDefault(); get([], ['baz'])">'Except' baz (GET)</a>
  `,
})
class VisitsPartialReloads {
  readonly foo = input(0)
  readonly bar = input<number>()
  readonly baz = input<number>()
  readonly page = usePage()

  constructor() {
    afterNextRender(() => (window._inertia_props = this.page().props))
  }

  visit(only: string[] = [], except: string[] = []): void {
    router.visit('/visits/partial-reloads', { data: { foo: this.foo() }, only, except })
  }

  get(only: string[] = [], except: string[] = []): void {
    router.get('/visits/partial-reloads', { foo: this.foo() }, { only, except })
  }
}

@Component({
  selector: 'test-visits-url-fragments',
  template: `
    <span class="text">This is the page that demonstrates url fragment behaviour using manual visits</span>
    <div style="width: 200vw; height: 200vh; margin-top: 50vh">
      <button type="button" (click)="updatePosition()">Update scroll positions</button>
      <div class="document-position">Document scroll position is {{ left() }} & {{ top() }}</div>
      <a href="#" (click)="$event.preventDefault(); router.visit('/visits/url-fragments#target')">Basic visit</a>
      <a href="#" (click)="$event.preventDefault(); router.visit('#target')">Fragment visit</a>
      <a href="#" (click)="$event.preventDefault(); router.visit('/visits/url-fragments#non-existent-fragment')"
        >Non-existent fragment visit</a
      >
      <a href="#" (click)="$event.preventDefault(); router.get('/visits/url-fragments#target')">Basic GET visit</a>
      <a href="#" (click)="$event.preventDefault(); router.get('#target')">Fragment GET visit</a>
      <a href="#" (click)="$event.preventDefault(); router.get('/visits/url-fragments#non-existent-fragment')"
        >Non-existent fragment GET visit</a
      >
      <div id="target">This is the element with id 'target'</div>
    </div>
  `,
})
class VisitsUrlFragments {
  readonly router = router
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
  selector: 'test-visits-wayfinder',
  template: `
    <a href="#" (click)="$event.preventDefault(); router.visit({ url: '/dump/post', method: 'post' })">Wayfinder object visit</a>
    <a href="#" (click)="$event.preventDefault(); router.visit({ url: '/dump/patch', method: 'get' }, { method: 'patch' })">Wayfinder object method override</a>
  `,
})
class VisitsWayfinder {
  readonly router = router
}

@Component({
  selector: 'test-visits-after-error',
  template: `
    <a href="#" (click)="$event.preventDefault(); router.visit('/dump/get')">Visit dump page</a>
    <a href="#" (click)="$event.preventDefault(); throwOnSuccess()">Throw error on success</a>
  `,
})
class VisitsAfterError {
  readonly router = router

  throwOnSuccess(): void {
    router.visit('/visits/after-error/2', {
      onSuccess: () => {
        throw new Error('Error after visit')
      },
    })
  }
}

@Component({ selector: 'test-visits-reload-on-mount', template: '<div>Name is {{ name() }}</div>' })
class VisitsReloadOnMount {
  readonly name = input<string>()

  constructor() {
    afterNextRender(() => router.reload({ only: ['name'] }))
  }
}

type ProxySite = { id: number; latestDeployment: { id: number; statuses: string[] } }

@Component({
  selector: 'test-visits-proxy',
  imports: [Deferred, DeferredContent, DeferredFallback, Link],
  template: `
    <p id="foo">Foo: {{ foo() }}</p>
    <inertia-deferred data="sites">
      <ng-template inertiaDeferredFallback>Loading...</ng-template>
      <ng-template inertiaDeferredContent>
        @for (site of sites(); track site.id) {
          <p>Site ID: {{ site.id }}</p>
          <p>Latest Deployment ID: {{ site.latestDeployment.id }}</p>
          <p [id]="'status-' + site.id">Statuses: {{ site.latestDeployment.statuses.join(', ') }}</p>
        }
      </ng-template>
    </inertia-deferred>
    <button type="button" (click)="update()">Update First Site Ref</button
    ><button type="button" (click)="reload()">Reload</button>
    <a inertiaLink href="/">Go Home</a>
  `,
})
class VisitsProxy {
  readonly foo = input(0)
  readonly sites = input<ProxySite[]>([])

  update(): void {
    const site = this.sites()[0]
    if (site)
      site.latestDeployment = {
        ...site.latestDeployment,
        statuses: [`frontend-${Math.floor(Math.random() * 1_000_000)}`],
      }
  }

  reload(): void {
    router.post('/visits/proxy', {}, { preserveScroll: true, preserveState: true, only: ['foo'] })
  }
}

@Component({
  selector: 'test-visits-raw-body',
  template: `
    <span class="text">This is the page that demonstrates HTTP client raw request bodies</span>
    <a href="#" (click)="$event.preventDefault(); send('url')">URLSearchParams Link</a>
    <a href="#" (click)="$event.preventDefault(); send('string')">String Link</a>
    <a href="#" (click)="$event.preventDefault(); send('blob')">Blob Link</a>
    <a href="#" (click)="$event.preventDefault(); send('buffer')">ArrayBuffer Link</a>
    <a href="#" (click)="$event.preventDefault(); send('view')">ArrayBufferView Link</a>
  `,
})
class VisitsRawBody {
  async send(kind: 'url' | 'string' | 'blob' | 'buffer' | 'view'): Promise<void> {
    const encoder = new TextEncoder()
    const bodies = {
      url: new URLSearchParams({ foo: 'bar' }),
      string: 'raw string contents',
      blob: new Blob(['raw blob contents'], { type: 'text/plain' }),
      buffer: encoder.encode('raw array buffer contents').buffer,
      view: encoder.encode('raw array buffer view contents'),
    }
    const response = await http.getClient().request({
      method: 'post',
      url: '/api/raw-body',
      data: bodies[kind],
      ...(kind === 'string' ? { headers: { 'Content-Type': 'text/plain' } } : {}),
    })
    window._raw_body_response = JSON.parse(String(response.data))
  }
}

@Component({
  selector: 'test-visits-async-location',
  template: `
    <span class="text">This is the page that demonstrates async location visits</span>
    <input id="draft" [value]="draft()" (input)="draft.set($any($event.target).value)" />
    <button type="button" (click)="reload(false)">Background reload</button>
    <button type="button" (click)="reload(true)">Background manual location</button>
    <button type="button" (click)="bannerMode.update((value) => !value)">Banner mode: {{ bannerMode() }}</button>
    <span id="version-change">{{ lastVersionChange() }}</span
    ><span id="banner">{{ banner() }}</span>
  `,
})
class VisitsAsyncLocation {
  readonly draft = signal('')
  readonly banner = signal('')
  readonly bannerMode = signal(false)
  readonly lastVersionChange = signal('')

  constructor() {
    const off = router.on('location', (event) => {
      this.lastVersionChange.set(String(event.detail.versionChange))
      if (this.bannerMode() && event.detail.versionChange) {
        event.preventDefault()
        this.banner.set('A new version is available')
      }
    })
    inject(DestroyRef).onDestroy(off)
  }

  reload(manual: boolean): void {
    router.reload({ headers: { [manual ? 'X-Simulate-Manual-Location' : 'X-Simulate-Version-Change']: '1' } })
  }
}

@Component({
  selector: 'test-reload-concurrent',
  template: `
    <div id="foo">Foo: {{ foo() }}</div>
    <div id="bar">Bar: {{ bar() }}</div>
    @if (withData()) {
      <div id="timeframe">Timeframe: {{ timeframe() }}</div>
    }
    <button type="button" (click)="reload()">Reload both props{{ withData() ? ' with data' : '' }}</button>
  `,
})
class ReloadConcurrent {
  readonly foo = input<string>()
  readonly bar = input<string>()
  readonly timeframe = input<string>()
  readonly withData = input(false)

  reload(): void {
    const data = this.withData() ? { timeframe: 'week' } : {}
    router.reload({ only: ['foo'], data })
    setTimeout(() => router.reload({ only: ['bar'], data }), 50)
  }
}

@Component({
  selector: 'test-reload-concurrent-with-data',
  template: `
    <div id="foo">Foo: {{ foo() }}</div>
    <div id="bar">Bar: {{ bar() }}</div>
    <div id="timeframe">Timeframe: {{ timeframe() }}</div>
    <button type="button" (click)="reload()">Reload both props with data</button>
  `,
})
class ReloadConcurrentWithData {
  readonly foo = input<string>()
  readonly bar = input<string>()
  readonly timeframe = input<string>()

  reload(): void {
    const data = { timeframe: 'week' }
    router.reload({ only: ['foo'], data })
    setTimeout(() => router.reload({ only: ['bar'], data }), 50)
  }
}

export const manualVisitPages: Record<string, ResolvedComponent> = {
  'Visits/Method': VisitsMethod,
  'Visits/Location': VisitsLocation,
  'Visits/AutomaticCancellation': VisitsAutomaticCancellation,
  'Visits/Data/Object': VisitsDataObject,
  'Visits/Data/FormData': VisitsDataFormData,
  'Visits/Data/AutoConverted': VisitsDataAutoConverted,
  'Visits/Data/RawBody': VisitsRawBody,
  'Visits/Headers': VisitsHeaders,
  'Visits/ErrorBags': VisitsErrorBags,
  'Visits/Replace': VisitsReplace,
  'Visits/PreserveState': VisitsPreserveState,
  'Visits/PreserveScroll': VisitsPreserveScroll,
  'Visits/PreserveScrollFalse': VisitsPreserveScrollFalse,
  'Visits/PartialReloads': VisitsPartialReloads,
  'Visits/UrlFragments': VisitsUrlFragments,
  'Visits/Wayfinder': VisitsWayfinder,
  'Visits/AfterError': VisitsAfterError,
  'Visits/ReloadOnMount': VisitsReloadOnMount,
  'Visits/Proxy': VisitsProxy,
  'Visits/AsyncLocationVisit': VisitsAsyncLocation,
  'Reload/Concurrent': ReloadConcurrent,
  'Reload/ConcurrentWithData': ReloadConcurrentWithData,
}
