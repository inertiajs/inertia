import { Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core'
import { LayoutOutlet, Link, router, useForm, type ResolvedComponent } from '@inertiajs/angular'

@Component({
  selector: 'test-prefetch-layout',
  imports: [LayoutOutlet, Link],
  template: `
    <a inertiaLink href="/prefetch/1" [prefetch]="true">On Hover (Default)</a>
    <a inertiaLink href="/prefetch/2" prefetch="mount">On Mount</a>
    <a inertiaLink href="/prefetch/3" prefetch="click">On Click</a>
    <a inertiaLink href="/prefetch/4" [prefetch]="['hover', 'mount']" cacheFor="1s">On Hover + Mount</a>
    <a inertiaLink href="/prefetch/5" prefetch="mount" [cacheFor]="0">On Mount (Once)</a>
    <a inertiaLink href="/prefetch/6" prefetch="click">On Enter</a>
    <button inertiaLink href="/prefetch/7" prefetch="click">On Spacebar</button>
    <inertia-layout-outlet />
  `,
})
class PrefetchLayout {}

@Component({
  selector: 'test-swr-layout',
  imports: [LayoutOutlet, Link],
  template: `
    <a inertiaLink href="/prefetch/swr/2" [prefetch]="true" cacheFor="1s">1s Expired</a>
    <a inertiaLink href="/prefetch/swr/3" [prefetch]="true" [cacheFor]="1000">1s Expired (Number)</a>
    <a inertiaLink href="/prefetch/swr/4" [prefetch]="true" [cacheFor]="['1s', '3s']">1s Stale, 2s Expired</a>
    <a inertiaLink href="/prefetch/swr/5" [prefetch]="true" [cacheFor]="[1000, 3000]">1s Stale, 2s Expired (Number)</a>
    <inertia-layout-outlet />
  `,
})
class SwrLayout {}

@Component({
  selector: 'test-prefetch-page',
  template:
    '<div>This is page {{ pageNumber() }}</div><div>Last loaded at <span id="last-loaded">{{ lastLoaded() }}</span></div>',
})
class PrefetchPage {
  static layout = PrefetchLayout
  readonly pageNumber = input('', { alias: 'pageNumber' })
  readonly lastLoaded = input(0, { alias: 'lastLoaded' })
}

@Component({
  selector: 'test-prefetch-swr',
  template:
    '<div>This is page {{ pageNumber() }}</div><div>Last loaded at <span id="last-loaded">{{ lastLoaded() }}</span></div>',
})
class PrefetchSwr {
  static layout = SwrLayout
  readonly pageNumber = input('', { alias: 'pageNumber' })
  readonly lastLoaded = input(0, { alias: 'lastLoaded' })
}

@Component({
  selector: 'test-prefetch-wayfinder',
  template: `
    <p>
      Is Prefetched: <span id="is-prefetched">{{ isPrefetched() }}</span>
    </p>
    <p>
      Is Prefetching: <span id="is-prefetching">{{ isPrefetching() }}</span>
    </p>
    <button type="button" id="test-prefetch" (click)="prefetch()">Test prefetch</button>
    <button type="button" id="test-flush" (click)="flush()">Test flush</button>
    <button type="button" id="flush-all" (click)="flushAll()">Flush all</button>
  `,
})
class PrefetchWayfinder {
  readonly isPrefetched = signal(false)
  readonly isPrefetching = signal(false)
  readonly target = { url: '/prefetch/swr/4', method: 'get' as const }

  constructor() {
    afterNextRender(() => this.check())
  }

  check(): void {
    this.isPrefetched.set(Boolean(router.getCached(this.target)))
    this.isPrefetching.set(Boolean(router.getPrefetching(this.target)))
  }

  prefetch(): void {
    router.prefetch(this.target, {
      onPrefetching: () => this.isPrefetching.set(true),
      onPrefetched: () => {
        this.isPrefetching.set(false)
        setTimeout(() => this.check())
      },
    })
  }

  flush(): void {
    router.flush(this.target)
    this.check()
  }

  flushAll(): void {
    router.flushAll()
    this.check()
  }
}

@Component({
  selector: 'test-prefetch-after-error',
  template: `
    <button type="button" (click)="prefetchPage()">Prefetch Page</button>
    <button type="button" (click)="visitPage()">Visit Page</button>
    <button type="button" (click)="prefetchNonInertia()">Prefetch Non-Inertia</button>
    <button type="button" (click)="visitNonInertia()">Visit Non-Inertia</button>
  `,
})
class PrefetchAfterError {
  prefetchPage(): void {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  visitPage(): void {
    router.visit('/prefetch/swr/1')
  }

  prefetchNonInertia(): void {
    router.prefetch('/non-inertia', { method: 'get' }, { cacheFor: 5000 })
  }

  visitNonInertia(): void {
    router.visit('/non-inertia')
  }
}

@Component({
  selector: 'test-prefetch-form',
  imports: [Link],
  template: `
    <p>
      Random Value: <span class="random-value">{{ randomValue() }}</span>
    </p>
    <button type="button" (click)="form.post('/prefetch/form')">Submit to Same URL</button>
    <button type="button" (click)="form.post('/prefetch/redirect-back')">Submit to Other URL</button>
    <a inertiaLink href="/prefetch/test-page">Back to Test Page</a>
  `,
})
class PrefetchForm {
  readonly randomValue = input(0)
  readonly form = useForm({})
}

@Component({
  selector: 'test-prefetch-test-page',
  imports: [Link],
  template: '<a inertiaLink href="/prefetch/form" [prefetch]="true">Go to Prefetch Form</a>',
})
class PrefetchTestPage {}

@Component({
  selector: 'test-prefetch-preserve-state',
  template: `
    <div>Current Page: {{ currentPage() }}</div>
    <div>Timestamp: {{ timestamp() }}</div>
    <button type="button" (click)="prefetch()">Prefetch Page 2</button>
    <button type="button" (click)="load(false)">Load Page 2 (preserveState: false)</button>
    <button type="button" (click)="load(true)">Load Page 2 (preserveState: true)</button>
  `,
})
class PrefetchPreserveState {
  readonly currentPage = input(0, { alias: 'page' })
  readonly timestamp = input(0)

  prefetch(): void {
    router.prefetch('/prefetch/preserve-state', { method: 'get', data: { page: 2 } }, { cacheFor: '30s' })
  }

  load(preserveState: boolean): void {
    router.get('/prefetch/preserve-state', { page: 2 }, { preserveState })
  }
}

@Component({
  selector: 'test-prefetch-navigate-event',
  imports: [Link],
  template: `
    <a inertiaLink href="/prefetch/navigate-event/cached" prefetch="mount">Prefetched Link</a>
    <a inertiaLink href="/prefetch/navigate-event/fresh">Regular Link</a>
  `,
})
class PrefetchNavigateEvent {
  constructor() {
    const off = router.on('navigate', (event) => console.log(String(event.detail.cached)))
    inject(DestroyRef).onDestroy(off)
  }
}

@Component({ selector: 'test-prefetch-navigate-target', template: '<div>This is the {{ label() }} target</div>' })
class PrefetchNavigateTarget {
  readonly label = input('')
}

@Component({
  selector: 'test-prefetch-tags',
  imports: [Link],
  template: `
    <div id="links">
      <a inertiaLink href="/prefetch/tags/1" prefetch="hover" [cacheTags]="['user', 'profile']">User Page 1</a>
      <a inertiaLink href="/prefetch/tags/2" prefetch="hover" [cacheTags]="['user', 'settings']">User Page 2</a>
      <a inertiaLink href="/prefetch/tags/3" prefetch="hover" [cacheTags]="['product', 'catalog']">Product Page 3</a>
      <a inertiaLink href="/prefetch/tags/4" prefetch="hover" [cacheTags]="['product', 'details']">Product Page 4</a>
      <a inertiaLink href="/prefetch/tags/5" prefetch="hover" [cacheTags]="tag('admin')">Admin Page 5</a>
      <a inertiaLink href="/prefetch/tags/6" prefetch="hover">Untagged Page 6</a>
    </div>
    <button type="button" id="flush-user" (click)="flushUser()">Flush User Tags</button>
    <button type="button" id="flush-user-product" (click)="flushUserProduct()">Flush User + Product Tags</button>
    <button type="button" id="programmatic-prefetch" (click)="programmaticPrefetch()">Programmatic Prefetch</button>
    <input id="form-name" [value]="form.data().name" (input)="form.setData('name', $any($event.target).value)" />
    <button type="button" id="submit-invalidate-user" (click)="submit()">Submit (Invalidate User)</button>
    <div>This is tags page {{ pageNumber() }}</div>
    <div>
      Last loaded at <span id="last-loaded">{{ lastLoaded() }}</span>
    </div>
  `,
})
class PrefetchTags {
  readonly pageNumber = input('')
  readonly lastLoaded = input(0)
  readonly propType = input('array')
  readonly form = useForm({ name: '' })

  tag(value: string): string | string[] {
    return this.propType() === 'string' ? value : [value]
  }

  flushUser(): void {
    router.flushByCacheTags(this.tag('user'))
  }

  flushUserProduct(): void {
    router.flushByCacheTags(['user', 'product'])
  }

  programmaticPrefetch(): void {
    router.prefetch('/prefetch/tags/2', { method: 'get' }, { cacheTags: this.tag('user') })
    router.prefetch('/prefetch/tags/3', { method: 'get' }, { cacheFor: '1m', cacheTags: this.tag('product') })
    router.prefetch('/prefetch/tags/6', { method: 'get' }, { cacheFor: '1m' })
  }

  submit(): void {
    this.form.post('/dump/post', { invalidateCacheTags: this.tag('user') })
  }
}

export const prefetchPages: Record<string, ResolvedComponent> = {
  'Prefetch/Page': PrefetchPage,
  'Prefetch/SWR': PrefetchSwr,
  'Prefetch/Wayfinder': PrefetchWayfinder,
  'Prefetch/AfterError': PrefetchAfterError,
  'Prefetch/Form': PrefetchForm,
  'Prefetch/TestPage': PrefetchTestPage,
  'Prefetch/PreserveState': PrefetchPreserveState,
  'Prefetch/NavigateEvent': PrefetchNavigateEvent,
  'Prefetch/NavigateEventTarget': PrefetchNavigateTarget,
  'Prefetch/Tags': PrefetchTags,
}
