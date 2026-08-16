import { Component, InjectionToken, Signal, afterNextRender, inject, input } from '@angular/core'
import { Head, InfiniteScroll, LayoutOutlet, Link, usePage, type ResolvedComponent } from '@inertiajs/angular'
import type { Method, Page } from '@inertiajs/core'
import { clientVisitPages } from './client-visit-pages'
import { configPages } from './config-pages'
import { corePages } from './core-pages'
import { deferredPages } from './deferred-pages'
import { ScrollableParentPage } from './dom-utils-page'
import { eventPages } from './events-page'
import { flashPages } from './flash-pages'
import { formComponentAdvancedPages } from './form-component-advanced-pages'
import { formComponentBasicPages } from './form-component-basic-pages'
import { formComponentContextPages } from './form-component-context-pages'
import { formComponentResetPages } from './form-component-reset-page'
import { formHelperPages } from './form-helper-pages'
import { headPages } from './head-pages'
import { historyPages } from './history-pages'
import { infiniteScrollAdvancedPages } from './infinite-scroll-advanced-pages'
import { infiniteScrollPages } from './infinite-scroll-pages'
import { instantVisitPages } from './instant-visit-pages'
import { layoutPages } from './layout-pages'
import { linkPages } from './link-pages'
import { manualVisitPages } from './manual-visit-pages'
import { nestedPages } from './nested-pages'
import { observabilityPages } from './observability-pages'
import { oncePages } from './once-pages'
import { optimisticPages } from './optimistic-pages'
import { pollPages } from './poll-pages'
import { precognitionPages } from './precognition-pages'
import { prefetchPages } from './prefetch-pages'
import { rememberPages } from './remember-pages'
import { useHttpPages } from './use-http-pages'
import { whenVisiblePages } from './when-visible-pages'

export type WithAppValue = {
  injected: string
  locale: string
  component: string
}

export const WITH_APP_VALUE = new InjectionToken<WithAppValue>('WITH_APP_VALUE', {
  factory: () => ({ injected: 'not-injected', locale: 'not-injected', component: 'not-injected' }),
})

@Component({
  selector: 'test-home',
  imports: [Head, Link],
  template: `
    <ng-template inertiaHead title="Home" />
    <div>
      <span class="text">This is the Test App Entrypoint page</span>
      <a inertiaLink href="/links/method" class="links-method">Basic Links</a>
      <a inertiaLink href="/links/replace" class="links-replace">'Replace' Links</a>
      <a inertiaLink href="/links/as-component" class="links-as-component">As Component</a>
      <a href="#" class="visits-method" (click)="visit($event, '/visits/method')">Manual basic visits</a>
      <a href="#" class="visits-replace" (click)="get($event, '/visits/replace')">Manual 'Replace' visits</a>
      <button inertiaLink href="/redirect" method="post" class="links-redirect">Internal Redirect Link</button>
      <button inertiaLink href="/redirect-external" method="post" class="links-external-redirect">
        External Redirect Link
      </button>
      <a href="#" (click)="post($event, '/redirect')">Manual Redirect visit</a>
      <a href="#" (click)="post($event, '/redirect-external')">Manual External Redirect visit</a>
      <a href="#" (click)="get($event, '/redirect-hash')">Manual Hash Redirect visit</a>
      <a href="#" (click)="post($event, '/redirect-hash')">Manual Hash Redirect POST visit</a>
      <a inertiaLink id="navigate-back" href="/head/mixed">Back to Mixed Head</a>
      <a inertiaLink href="/links/as-element" class="link-targets-self" target="_self">Target _self</a>
      <a inertiaLink href="/links/as-element" class="link-targets-blank" target="_blank">Target _blank</a>
    </div>
  `,
})
class Home {
  readonly example = input('')
  readonly page = usePage()

  constructor() {
    afterNextRender(() => {
      window._inertia_props = this.page().props
    })
  }

  visit(event: MouseEvent, href: string): void {
    event.preventDefault()
    window.testing.Inertia.visit(href)
  }

  get(event: MouseEvent, href: string): void {
    event.preventDefault()
    window.testing.Inertia.get(href)
  }

  post(event: MouseEvent, href: string): void {
    event.preventDefault()
    window.testing.Inertia.post(href)
  }
}

@Component({
  selector: 'test-unified-props',
  imports: [Link],
  template: `
    <h1>Unified Props Test</h1>
    <p id="foo">Foo: {{ foo() }}</p>
    <p id="count">Count: {{ count() }}</p>
    <p id="items">Items: {{ items().join(', ') }}</p>
    <a inertiaLink href="/unified/navigate">Navigate</a>
  `,
})
class UnifiedProps {
  readonly foo = input('')
  readonly count = input(0)
  readonly items = input<string[]>([])
}

@Component({
  selector: 'test-with-app',
  template: `
    <h1 data-testid="with-app-title">SSR WithApp</h1>
    <p data-testid="with-app-value">Value: {{ value.injected }}</p>
    <p data-testid="with-app-locale">Locale: {{ value.locale }}</p>
    <p data-testid="with-app-component">Component: {{ value.component }}</p>
  `,
})
class WithAppPage {
  readonly value = inject(WITH_APP_VALUE)
}

@Component({
  selector: 'test-navigate-non-inertia',
  template: `
    <h1>Navigate Non-Inertia</h1>
    <p><a href="/non-inertia" (click)="navigate($event)">Go to non-Inertia page</a></p>
  `,
})
class NavigateNonInertia {
  navigate(event: MouseEvent): void {
    event.preventDefault()
    window.history.replaceState({ foo: {} }, '')
    window.location.href = '/non-inertia'
  }
}

@Component({
  selector: 'test-dump',
  template: '<div class="text">This is Inertia page component containing a data dump of the request</div>',
})
class Dump {
  readonly headers = input<Record<string, string>>({})
  readonly method = input<Method>('get')
  readonly form = input<Record<string, unknown> | undefined>(undefined)
  readonly files = input<unknown>({})
  readonly query = input<Record<string, unknown>>({})
  readonly url = input('')
  readonly page = usePage()

  constructor() {
    afterNextRender(() => {
      window._inertia_request_dump = {
        headers: this.headers(),
        method: this.method(),
        form: this.form(),
        files: this.files() ?? {},
        query: this.query(),
        url: this.url(),
        $page: this.page(),
      }
    })
  }
}

@Component({
  selector: 'test-use-page-child',
  template: `
    <p><em>From child component:</em></p>
    <p data-testid="child-url">URL: {{ page().url }}</p>
    <p data-testid="child-component">Component: {{ page().component }}</p>
    <p data-testid="child-same-ref">
      Same instance as parent: <strong>{{ page === parentPage() ? 'yes' : 'no' }}</strong>
    </p>
  `,
})
class UsePageChild {
  readonly parentPage = input.required<Signal<Page>>()
  readonly page = usePage()
}

@Component({
  selector: 'test-use-page-one',
  imports: [Link, UsePageChild],
  template: `
    <h2>Page 1</h2>
    <p data-testid="name-props">
      Name (props): <strong>{{ name() }}</strong>
    </p>
    <p data-testid="name-usepage">
      Name (usePage): <strong>{{ pageA().props.name }}</strong>
    </p>
    <p data-testid="url">URL: {{ pageA().url }}</p>
    <p data-testid="same-ref">
      usePage() same instance: <strong>{{ pageA === pageB ? 'yes' : 'no' }}</strong>
    </p>
    <test-use-page-child [parentPage]="pageA" />
    <a inertiaLink data-testid="go-page2" href="/use-page/page2">Go to Page 2</a>
  `,
})
class UsePageOne {
  readonly name = input('')
  readonly pageA = usePage<{ name?: string }>()
  readonly pageB = usePage()
}

@Component({
  selector: 'test-use-page-two',
  imports: [Link, UsePageChild],
  template: `
    <h2>Page 2</h2>
    <p data-testid="title-props">
      Title (props): <strong>{{ title() }}</strong>
    </p>
    <p data-testid="title-usepage">
      Title (usePage): <strong>{{ pageA().props.title }}</strong>
    </p>
    <p data-testid="url">URL: {{ pageA().url }}</p>
    <p data-testid="same-ref">
      usePage() same instance: <strong>{{ pageA === pageB ? 'yes' : 'no' }}</strong>
    </p>
    <test-use-page-child [parentPage]="pageA" />
    <a inertiaLink data-testid="go-page1" href="/use-page/page1">Go to Page 1</a>
  `,
})
class UsePageTwo {
  readonly title = input('')
  readonly pageA = usePage<{ title?: string }>()
  readonly pageB = usePage()
}

@Component({
  selector: 'test-ssr-page-one',
  imports: [Link],
  template: `
    <h1 data-testid="ssr-title">SSR Page 1</h1>
    <p data-testid="user-name">Name: {{ user().name }}</p>
    <p>Email: {{ user().email }}</p>
    <ul>
      @for (item of items(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
    <p data-testid="count">Count: {{ count() }}</p>
    <p data-testid="page-url">URL: {{ page().url }}</p>
    <a inertiaLink href="/ssr/page2" data-testid="navigate-link">Page 2</a>
  `,
})
class SsrPageOne {
  readonly user = input({ name: '', email: '' })
  readonly items = input<string[]>([])
  readonly count = input(0)
  readonly page = usePage()
}

@Component({
  selector: 'test-ssr-page-two',
  imports: [Link],
  template: `
    <h1 data-testid="ssr-title">SSR Page 2</h1>
    <p data-testid="navigated-status">Navigated: {{ navigatedTo() }}</p>
    <a inertiaLink href="/ssr/page1" data-testid="back-link">Page 1</a>
  `,
})
class SsrPageTwo {
  readonly navigatedTo = input(false)
}

@Component({ selector: 'test-message', template: '<p>{{ message() }}</p>' })
class MessagePage {
  readonly message = input('')
}

@Component({
  selector: 'test-head-title',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="SSR Head Title" />
    <p>Head title rendered on the server</p>
  `,
})
class HeadTitle {}

@Component({
  selector: 'test-head-xss',
  imports: [Head],
  template: `
    <ng-template inertiaHead [title]="title()" />
    <p>Escaped title</p>
  `,
})
class HeadWithXssTitle {
  readonly title = input('')
}

@Component({ selector: 'test-server-head', template: '<p>Server head rendered on the server</p>' })
class ServerHead {}

@Component({
  selector: 'test-ssr-layout',
  imports: [LayoutOutlet],
  template: '<section><h1 data-testid="layout-title">{{ title() }}</h1><inertia-layout-outlet /></section>',
})
class SsrLayout {
  readonly title = input('Default Title')
}

@Component({ selector: 'test-layout-a', template: '<p data-testid="page-content">Page A Content</p>' })
class LayoutPropsA {
  static layout = [SsrLayout, { title: 'Page A Title' }]
}

@Component({ selector: 'test-layout-b', template: '<p data-testid="page-content">Page B Content</p>' })
class LayoutPropsB {
  static layout = SsrLayout
}

@Component({ selector: 'test-layout-callback', template: '<p data-testid="page-content">Callback Content</p>' })
class LayoutPropsCallback {
  static layout = (props: Record<string, unknown>) => [SsrLayout, { title: `Profile: ${String(props['pageTitle'])}` }]
}

@Component({
  selector: 'test-infinite-ssr',
  imports: [InfiniteScroll],
  template: `
    <div [inertiaInfiniteScroll]="'users'" #scroll="inertiaInfiniteScroll">
      <p data-testid="has-previous">Has previous: {{ scroll.hasPreviousPage() }}</p>
      <p data-testid="has-next">Has next: {{ scroll.hasNextPage() }}</p>
    </div>
  `,
})
class InfiniteScrollPage {}

export const pages: Record<string, ResolvedComponent> = {
  ...configPages,
  ...clientVisitPages,
  ...corePages,
  ...deferredPages,
  ...eventPages,
  ...flashPages,
  ...formComponentAdvancedPages,
  ...formComponentBasicPages,
  ...formComponentContextPages,
  ...formComponentResetPages,
  ...formHelperPages,
  ...instantVisitPages,
  ...headPages,
  ...historyPages,
  ...infiniteScrollAdvancedPages,
  ...infiniteScrollPages,
  ...linkPages,
  ...manualVisitPages,
  ...nestedPages,
  ...oncePages,
  ...optimisticPages,
  ...observabilityPages,
  ...layoutPages,
  ...pollPages,
  ...prefetchPages,
  ...precognitionPages,
  ...rememberPages,
  ...useHttpPages,
  ...whenVisiblePages,
  Home,
  ScrollableParent: ScrollableParentPage,
  Dump,
  NavigateNonInertia,
  'Unified/Props': UnifiedProps,
  'SSR/WithApp': WithAppPage,
  'UsePage/Page1': UsePageOne,
  'UsePage/Page2': UsePageTwo,
  'SSR/Page1': SsrPageOne,
  'SSR/Page2': SsrPageTwo,
  'SSR/PageWithScriptElement': MessagePage,
  'SSR/HeadTitle': HeadTitle,
  'SSR/HeadWithXssTitle': HeadWithXssTitle,
  'SSR/ServerHead': ServerHead,
  'SSR/LayoutPropsA': LayoutPropsA as unknown as ResolvedComponent,
  'SSR/LayoutPropsB': LayoutPropsB,
  'SSR/LayoutPropsCallback': LayoutPropsCallback as ResolvedComponent,
  'SSR/InfiniteScroll': InfiniteScrollPage,
}

export const fallbackPage = Home
