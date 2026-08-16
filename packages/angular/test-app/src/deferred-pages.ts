import { Component, afterNextRender, input } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  DeferredRescue,
  Link,
  router,
  useForm,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'

type TextProp = { text: string }
type ResultsProp = { data: string[]; page: number }

const deferredImports = [Deferred, DeferredContent, DeferredFallback] as const

@Component({
  selector: 'test-deferred-page-one',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="foo">
      <ng-template inertiaDeferredFallback><div>Loading foo...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.foo?.text }}</ng-template>
    </inertia-deferred>
    <inertia-deferred data="bar">
      <ng-template inertiaDeferredFallback><div>Loading bar...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.bar?.text }}</ng-template>
    </inertia-deferred>
    <a inertiaLink href="/deferred-props/page-1">Page 1</a>
    <a inertiaLink href="/deferred-props/page-2">Page 2</a>
    <a inertiaLink href="/deferred-props/page-3" prefetch="hover">Page 3</a>
  `,
})
class DeferredPageOne {
  readonly page = usePage<{ foo?: TextProp; bar?: TextProp }>()
}

@Component({
  selector: 'test-deferred-page-two',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="baz">
      <ng-template inertiaDeferredFallback><div>Loading baz...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.baz }}</ng-template>
    </inertia-deferred>
    <inertia-deferred data="qux">
      <ng-template inertiaDeferredFallback><div>Loading qux...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.qux }}</ng-template>
    </inertia-deferred>
    <inertia-deferred [data]="['baz', 'qux']">
      <ng-template inertiaDeferredFallback><div>Loading baz and qux...</div></ng-template>
      <ng-template inertiaDeferredContent>both {{ page().props.baz }} and {{ page().props.qux }}</ng-template>
    </inertia-deferred>
    <a inertiaLink href="/deferred-props/page-2">Page 2</a>
  `,
})
class DeferredPageTwo {
  readonly page = usePage<{ baz?: string; qux?: string }>()
}

@Component({
  selector: 'test-deferred-page-three',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="alpha">
      <ng-template inertiaDeferredFallback><div>Loading alpha...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.alpha }}</ng-template>
    </inertia-deferred>
    <inertia-deferred data="beta">
      <ng-template inertiaDeferredFallback><div>Loading beta...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.beta }}</ng-template>
    </inertia-deferred>
  `,
})
class DeferredPageThree {
  readonly page = usePage<{ alpha?: string; beta?: string }>()
}

@Component({
  selector: 'test-deferred-many-groups',
  imports: [deferredImports, Link],
  template: `
    @for (key of keys; track key) {
      <inertia-deferred [data]="key">
        <ng-template inertiaDeferredFallback
          ><div>Loading {{ key }}...</div></ng-template
        >
        <ng-template inertiaDeferredContent>{{ text(key) }}</ng-template>
      </inertia-deferred>
    }
    <a inertiaLink href="/deferred-props/page-1">Page 1</a>
    <a inertiaLink href="/deferred-props/page-2">Page 2</a>
    <a inertiaLink href="/deferred-props/many-groups">Many groups</a>
  `,
})
class DeferredManyGroups {
  readonly keys = ['foo', 'bar', 'baz', 'qux', 'quux'] as const
  readonly page = usePage<Record<(typeof this.keys)[number], TextProp | undefined>>()

  text(key: (typeof this.keys)[number]): string {
    return this.page().props[key]?.text ?? ''
  }
}

@Component({
  selector: 'test-deferred-instant-reload',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="foo">
      <ng-template inertiaDeferredFallback><div>Loading foo...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ foo()?.text }}</ng-template>
    </inertia-deferred>
    <inertia-deferred data="bar">
      <ng-template inertiaDeferredFallback><div>Loading bar...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ bar()?.text }}</ng-template>
    </inertia-deferred>
  `,
})
class DeferredInstantReload {
  readonly foo = input<TextProp>()
  readonly bar = input<TextProp>()

  constructor() {
    afterNextRender(() => router.reload({ only: ['foo'] }))
  }
}

@Component({
  selector: 'test-deferred-partial-reload',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="foo">
      <ng-template inertiaDeferredFallback><div>Loading foo...</div></ng-template>
      <ng-template inertiaDeferredContent><div id="foo-timestamp">{{ page().props.foo?.timestamp }}</div></ng-template>
    </inertia-deferred>
    <inertia-deferred data="bar">
      <ng-template inertiaDeferredFallback><div>Loading bar...</div></ng-template>
      <ng-template inertiaDeferredContent><div id="bar-timestamp">{{ page().props.bar?.timestamp }}</div></ng-template>
    </inertia-deferred>
    <button type="button" (click)="reload(['foo'])">Reload foo only</button>
    <button type="button" (click)="reload(['bar'])">Reload bar only</button>
    <button type="button" (click)="reload(['foo', 'bar'])">Reload both</button>
  `,
})
class DeferredPartialReloads {
  readonly page = usePage<{ foo?: { timestamp: string }; bar?: { timestamp: string } }>()
  reload(only: string[]): void {
    router.reload({ only })
  }
}

@Component({
  selector: 'test-deferred-with-partial-reload',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="users">
      <ng-template inertiaDeferredFallback><span>Loading...</span></ng-template>
      <ng-template inertiaDeferredContent let-reloading="reloading">
        @if (reloading) {
          <span id="reloading-indicator">Reloading...</span>
        }
        @for (user of page().props.users ?? []; track user.id) {
          <span>{{ user.name }}</span>
        }
      </ng-template>
    </inertia-deferred>
    <button type="button" (click)="reload()">Trigger a partial reload</button>
    <a inertiaLink href="/deferred-props/page-1" prefetch="hover">Prefetch</a>
  `,
})
class DeferredWithPartialReload {
  readonly withOnly = input<string[]>()
  readonly withExcept = input<string[]>()
  readonly page = usePage<{ users?: Array<{ id: number; name: string }> }>()

  reload(): void {
    router.reload({ only: this.withOnly(), except: this.withExcept() })
  }
}

@Component({
  selector: 'test-deferred-query-params',
  imports: [deferredImports],
  template: `
    <div>Filter: {{ filter() }}</div>
    <inertia-deferred data="users">
      <ng-template inertiaDeferredFallback><div>Loading users...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.users?.text }}</ng-template>
    </inertia-deferred>
  `,
})
class DeferredWithQueryParams {
  readonly filter = input('')
  readonly page = usePage<{ users?: TextProp }>()
}

@Component({
  selector: 'test-deferred-results',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="results">
      <ng-template inertiaDeferredFallback><div>Loading results...</div></ng-template>
      <ng-template inertiaDeferredContent>
        <div id="results-data">{{ page().props.results?.data?.join(', ') }}</div>
        <div id="results-page">Page: {{ page().props.results?.page }}</div>
      </ng-template>
    </inertia-deferred>
    <button type="button" (click)="reload()">Reload with page 2</button>
  `,
})
class DeferredWithReload {
  readonly page = usePage<{ results?: ResultsProp }>()
  reload(): void {
    router.reload({ data: { page: 2 } })
  }
}

@Component({
  selector: 'test-deferred-results-required',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="results">
      <ng-template inertiaDeferredFallback><div>Loading results...</div></ng-template>
      <ng-template inertiaDeferredContent>
        <div id="results-data">{{ results().data.join(', ') }}</div>
        <div id="results-page">Page: {{ results().page }}</div>
      </ng-template>
    </inertia-deferred>
    <button type="button" (click)="reload()">Reload with page 2</button>
  `,
})
class DeferredReloadWithoutOptionalChaining {
  readonly results = input.required<ResultsProp>()
  reload(): void {
    router.reload({ data: { page: 2 } })
  }
}

@Component({
  selector: 'test-deferred-with-errors',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="foo">
      <ng-template inertiaDeferredFallback><div>Loading foo...</div></ng-template>
      <ng-template inertiaDeferredContent
        ><div id="foo">{{ page().props.foo?.text }}</div></ng-template
      >
    </inertia-deferred>
    @if (page().props.errors.name; as error) {
      <p id="page-error">{{ error }}</p>
    }
    @if (form.errors().name; as error) {
      <p id="form-error">{{ error }}</p>
    }
    <button type="button" (click)="form.post('/deferred-props/with-errors')">Submit</button>
  `,
})
class DeferredWithErrors {
  readonly page = usePage<{ foo?: TextProp; errors?: { name?: string } }>()
  readonly form = useForm({ name: '' })
}

@Component({
  selector: 'test-deferred-with-rescued-errors',
  imports: [deferredImports, DeferredRescue],
  template: `
    <inertia-deferred data="foo">
      <ng-template inertiaDeferredFallback><div>Loading foo...</div></ng-template>
      <ng-template inertiaDeferredRescue let-reloading="reloading">
        <div id="foo-error">Unable to load foo.</div>
        <span id="reloading">{{ reloading }}</span>
      </ng-template>
      <ng-template inertiaDeferredContent
        ><div id="foo">{{ page().props.foo?.text }}</div></ng-template
      >
    </inertia-deferred>
    <button type="button" (click)="retry()">Retry</button>
  `,
})
class DeferredWithRescuedErrors {
  readonly page = usePage<{ foo?: TextProp | null }>()
  retry(): void {
    router.reload({ only: ['foo'], headers: { 'X-Test-Retry': 'true' } })
  }
}

@Component({
  selector: 'test-deferred-rapid-navigation',
  imports: [deferredImports, Link],
  template: `
    <div>Page: {{ id() }}</div>
    @for (key of keys; track key) {
      <inertia-deferred [data]="key">
        <ng-template inertiaDeferredFallback
          ><div>Loading {{ key }}...</div></ng-template
        >
        <ng-template inertiaDeferredContent>{{ text(key) }}</ng-template>
      </inertia-deferred>
    }
    <a inertiaLink href="/deferred-props/rapid-navigation/a">Page A</a>
    <a inertiaLink href="/deferred-props/rapid-navigation/b">Page B</a>
    <a inertiaLink href="/deferred-props/rapid-navigation/c">Page C</a>
    <a inertiaLink href="/deferred-props/page-1">Navigate Away</a>
    <button type="button" (click)="navigateWithConfirmation()">Navigate with onBefore</button>
    <button type="button" (click)="router.reload()">Plain reload</button>
    <button type="button" (click)="router.visit('/deferred-props/rapid-navigation/' + id() + '?foo=bar')">
      Add query param
    </button>
    <button type="button" (click)="router.prefetch('/deferred-props/page-1')">Prefetch Page 1</button>
  `,
})
class DeferredRapidNavigation {
  readonly id = input('')
  readonly keys = ['users', 'stats', 'activity'] as const
  readonly page = usePage<{ users?: TextProp; stats?: TextProp; activity?: TextProp }>()
  readonly router = router
  text(key: (typeof this.keys)[number]): string {
    return this.page().props[key]?.text ?? ''
  }
  navigateWithConfirmation(): void {
    if (confirm('Navigate away?')) router.visit('/deferred-props/page-2')
  }
}

@Component({
  selector: 'test-deferred-back-a',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="fastProp">
      <ng-template inertiaDeferredFallback><div>Loading fast prop...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.fastProp }}</ng-template>
    </inertia-deferred>
    <inertia-deferred data="slowProp">
      <ng-template inertiaDeferredFallback><div>Loading slow prop...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.slowProp }}</ng-template>
    </inertia-deferred>
    <a inertiaLink href="/deferred-props/back-button/b">Go to Page B</a>
  `,
})
class DeferredBackA {
  readonly page = usePage<{ fastProp?: string; slowProp?: string }>()
}

@Component({
  selector: 'test-deferred-back-b',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="data">
      <ng-template inertiaDeferredFallback><div>Loading data...</div></ng-template>
      <ng-template inertiaDeferredContent>{{ page().props.data }}</ng-template>
    </inertia-deferred>
    <a inertiaLink href="/deferred-props/back-button/a">Go to Page A</a>
  `,
})
class DeferredBackB {
  readonly page = usePage<{ data?: string }>()
}

@Component({
  selector: 'test-deferred-tab-duplication',
  imports: [deferredImports],
  template: `
    <inertia-deferred data="message">
      <ng-template inertiaDeferredFallback><div id="fallback">Loading message...</div></ng-template>
      <ng-template inertiaDeferredContent
        ><div id="message">{{ page().props.message }}</div></ng-template
      >
    </inertia-deferred>
  `,
})
class DeferredTabDuplication {
  readonly page = usePage<{ message?: string }>()
}

export const deferredPages: Record<string, ResolvedComponent> = {
  'DeferredProps/Page1': DeferredPageOne,
  'DeferredProps/Page2': DeferredPageTwo,
  'DeferredProps/Page3': DeferredPageThree,
  'DeferredProps/ManyGroups': DeferredManyGroups,
  'DeferredProps/InstantReload': DeferredInstantReload,
  'DeferredProps/PartialReloads': DeferredPartialReloads,
  'DeferredProps/RapidNavigation': DeferredRapidNavigation,
  'DeferredProps/ReloadWithoutOptionalChaining': DeferredReloadWithoutOptionalChaining,
  'DeferredProps/TabDuplication': DeferredTabDuplication,
  'DeferredProps/WithErrors': DeferredWithErrors,
  'DeferredProps/WithPartialReload': DeferredWithPartialReload,
  'DeferredProps/WithQueryParams': DeferredWithQueryParams,
  'DeferredProps/WithReload': DeferredWithReload,
  'DeferredProps/WithRescuedErrors': DeferredWithRescuedErrors,
  'DeferredProps/BackButton/PageA': DeferredBackA,
  'DeferredProps/BackButton/PageB': DeferredBackB,
}
