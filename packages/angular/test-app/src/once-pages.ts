import { Component, input } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  Link,
  router,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'

@Component({
  selector: 'test-once-page-a',
  imports: [Link],
  template: `
    <p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p>
    <a inertiaLink href="/once-props/page-b">Go to Page B</a><a inertiaLink href="/once-props/page-c">Go to Page C</a>
    <a inertiaLink href="/once-props/page-d" prefetch="mount">Go to Page D</a>
    <a inertiaLink href="/once-props/page-e" prefetch="mount" [cacheFor]="1000">Go to Page E (short cache)</a>
    <button type="button" (click)="router.reload({ only: ['foo'] })">Reload (only foo)</button>
    <button type="button" (click)="router.replaceProp('foo', 'replaced-foo')">Replace foo</button>
  `,
})
class OncePageA {
  readonly foo = input<string>()
  readonly bar = input('')
  readonly router = router
}

@Component({
  selector: 'test-once-page-b',
  imports: [Link],
  template: `
    <p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p>
    <a inertiaLink href="/once-props/page-a">Go to Page A</a><button type="button" (click)="router.reload({ only: ['foo'] })">Reload (only foo)</button>
  `,
})
class OncePageB {
  readonly foo = input<string>()
  readonly bar = input('')
  readonly router = router
}

@Component({
  selector: 'test-once-page-c',
  imports: [Link],
  template:
    '<a inertiaLink href="/once-props/page-a">Go to Page A</a><a inertiaLink href="/once-props/page-b">Go to Page B</a><a inertiaLink href="/once-props/page-d" prefetch="mount">Go to Page D</a>',
})
class OncePageC {}

@Component({
  selector: 'test-once-display',
  template: '<p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p>',
})
class OnceDisplay {
  readonly foo = input<string>()
  readonly bar = input('')
}

@Component({
  selector: 'test-once-partial-a',
  imports: [Link],
  template: `
    <p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p>
    <a inertiaLink href="/once-props/partial-reload/b">Go to Partial Reload B</a><button type="button" (click)="router.reload({ only: ['foo'] })">Reload (only foo)</button>
  `,
})
class OncePartialA {
  readonly foo = input('')
  readonly bar = input('')
  readonly router = router
}

@Component({
  selector: 'test-once-partial-b',
  imports: [Link],
  template:
    '<p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p><a inertiaLink href="/once-props/partial-reload/a">Go to Partial Reload A</a>',
})
class OncePartialB {
  readonly foo = input('')
  readonly bar = input('')
}

const deferredImports = [Deferred, DeferredContent, DeferredFallback] as const

@Component({
  selector: 'test-once-deferred',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="foo"
      ><ng-template inertiaDeferredFallback><div>Loading foo...</div></ng-template
      ><ng-template inertiaDeferredContent
        ><p id="foo">Foo: {{ page().props.foo?.text }}</p></ng-template
      ></inertia-deferred
    >
    <p id="bar">Bar: {{ bar() }}</p>
    @if (page().component === 'OnceProps/DeferredPageA') {
      <a inertiaLink href="/once-props/deferred/b">Go to Deferred Page B</a
      ><a inertiaLink href="/once-props/deferred/c" prefetch="mount">Go to Deferred Page C</a>
    } @else {
      <a inertiaLink href="/once-props/deferred/a">Go to Deferred Page A</a>
    }
  `,
})
class OnceDeferred {
  readonly bar = input('')
  readonly page = usePage<{ foo?: { text: string } }>()
}

@Component({
  selector: 'test-once-slow-deferred',
  imports: [deferredImports, Link],
  template: `
    <inertia-deferred data="foo"
      ><ng-template inertiaDeferredFallback><div id="foo-loading">Loading foo...</div></ng-template
      ><ng-template inertiaDeferredContent
        ><p id="foo">Foo: {{ page().props.foo }}</p></ng-template
      ></inertia-deferred
    >
    <p id="bar">Bar: {{ bar() }}</p>
    @if (page().component === 'OnceProps/SlowDeferredPageA') {
      <a inertiaLink href="/once-props/slow-deferred/b">Go to Page B</a>
    } @else {
      <a inertiaLink href="/once-props/slow-deferred/a">Go to Page A</a>
    }
  `,
})
class OnceSlowDeferred {
  readonly bar = input('')
  readonly page = usePage<{ foo?: string }>()
}

@Component({
  selector: 'test-once-ttl-a',
  imports: [Link],
  template: `
    <p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p>
    <a inertiaLink href="/once-props/ttl/b">Go to TTL Page B</a><a inertiaLink href="/once-props/ttl/c" prefetch="mount">Go to TTL Page C</a>
    <button type="button" (click)="router.reload({ only: ['foo'] })">Reload foo</button>
  `,
})
class OnceTtlA {
  readonly foo = input('')
  readonly bar = input('')
  readonly router = router
}

@Component({
  selector: 'test-once-ttl-other',
  imports: [Link],
  template:
    '<p id="foo">Foo: {{ foo() }}</p><p id="bar">Bar: {{ bar() }}</p><a inertiaLink href="/once-props/ttl/a">Go to TTL Page A</a>',
})
class OnceTtlOther {
  readonly foo = input('')
  readonly bar = input('')
}

@Component({
  selector: 'test-once-optional',
  imports: [Link],
  template: `
    <p id="foo">Foo: {{ foo() ?? 'not loaded' }}</p><p id="bar">Bar: {{ bar() }}</p>
    @if (page().component === 'OnceProps/OptionalPageA') { <a inertiaLink href="/once-props/optional/b">Go to Optional Page B</a> } @else { <a inertiaLink href="/once-props/optional/a">Go to Optional Page A</a> }
    <button type="button" (click)="router.reload({ only: ['foo'] })">Load foo</button>
  `,
})
class OnceOptional {
  readonly foo = input<string>()
  readonly bar = input('')
  readonly page = usePage()
  readonly router = router
}

@Component({
  selector: 'test-once-merge',
  imports: [Link],
  template: `
    <p id="items">Items count: {{ items().length }}</p><p id="bar">Bar: {{ bar() }}</p>
    @if (page().component === 'OnceProps/MergePageA') { <a inertiaLink href="/once-props/merge/b">Go to Merge Page B</a> } @else { <a inertiaLink href="/once-props/merge/a">Go to Merge Page A</a> }
    <button type="button" (click)="router.reload({ only: ['items'] })">Load more items</button>
  `,
})
class OnceMerge {
  readonly items = input.required<string[]>()
  readonly bar = input('')
  readonly page = usePage()
  readonly router = router
}

@Component({
  selector: 'test-once-custom-key',
  imports: [Link],
  template: `
    <p id="permissions">Permissions: {{ permissions() }}</p>
    <p id="bar">Bar: {{ bar() }}</p>
    @if (page().component === 'OnceProps/CustomKeyPageA') {
      <a inertiaLink href="/once-props/custom-key/b">Go to Custom Key Page B</a>
    } @else {
      <a inertiaLink href="/once-props/custom-key/a">Go to Custom Key Page A</a>
    }
  `,
})
class OnceCustomKey {
  readonly userPermissions = input<string>()
  readonly permissionValue = input<string>('', { alias: 'permissions' })
  readonly bar = input('')
  readonly page = usePage()
  permissions(): string {
    return this.userPermissions() ?? this.permissionValue()
  }
}

@Component({
  selector: 'test-once-client-visit',
  template: `
    <p id="foo">Foo: {{ foo() }}</p>
    <p id="bar">Bar: {{ bar() }}</p>
    <button type="button" (click)="push(false)">Push without preserving</button
    ><button type="button" (click)="push(true)">Push with once props</button>
  `,
})
class OnceClientVisit {
  readonly foo = input<string>()
  readonly bar = input('')
  push(preserve: boolean): void {
    router.push({
      url: '/once-props/client-side-visit',
      component: 'OnceProps/ClientSideVisit',
      props: preserve ? (_current, once) => ({ ...once, bar: 'bar-updated' }) : { bar: 'bar-updated' },
    })
  }
}

export const oncePages: Record<string, ResolvedComponent> = {
  'OnceProps/PageA': OncePageA,
  'OnceProps/PageB': OncePageB,
  'OnceProps/PageC': OncePageC,
  'OnceProps/PageD': OnceDisplay,
  'OnceProps/PageE': OnceDisplay,
  'OnceProps/PartialReloadA': OncePartialA,
  'OnceProps/PartialReloadB': OncePartialB,
  'OnceProps/DeferredPageA': OnceDeferred,
  'OnceProps/DeferredPageB': OnceDeferred,
  'OnceProps/DeferredPageC': OnceDeferred,
  'OnceProps/SlowDeferredPageA': OnceSlowDeferred,
  'OnceProps/SlowDeferredPageB': OnceSlowDeferred,
  'OnceProps/TtlPageA': OnceTtlA,
  'OnceProps/TtlPageB': OnceTtlOther,
  'OnceProps/TtlPageC': OnceTtlOther,
  'OnceProps/OptionalPageA': OnceOptional,
  'OnceProps/OptionalPageB': OnceOptional,
  'OnceProps/MergePageA': OnceMerge,
  'OnceProps/MergePageB': OnceMerge,
  'OnceProps/CustomKeyPageA': OnceCustomKey,
  'OnceProps/CustomKeyPageB': OnceCustomKey,
  'OnceProps/ClientSideVisit': OnceClientVisit,
}
