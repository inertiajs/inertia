import { Component, OnChanges, input, signal } from '@angular/core'
import { Link, router, type ResolvedComponent } from '@inertiajs/angular'
import type { Page } from '@inertiajs/core'

@Component({
  selector: 'test-async-a',
  imports: [Link],
  template:
    '<div>Page: A</div><a inertiaLink href="/async-visits/page-b" [async]="true">Go to B async</a><a inertiaLink href="/async-visits/page-a" [async]="true">Go to A async</a><a inertiaLink href="/async-visits/page-c">Go to C</a>',
})
class AsyncA {}

@Component({
  selector: 'test-async-b',
  imports: [Link],
  template: '<div>Page: B</div><a inertiaLink href="/async-visits/page-a">Go to A</a>',
})
class AsyncB {}

@Component({
  selector: 'test-async-c',
  imports: [Link],
  template: '<div>Page: C</div><a inertiaLink href="/async-visits/page-a">Go to A</a>',
})
class AsyncC {}

@Component({
  selector: 'test-async-reload',
  imports: [Link],
  template:
    '<div>Page: Reload Origin</div><button type="button" (click)="router.reload({ headers: { \'X-Repro-Delay\': \'1\' } })">Reload</button><a inertiaLink href="/async-visits/page-c">Go to C</a>',
})
class AsyncReload {
  readonly router = router
}

type ClientPageProps = { foo: string; bar: string }

@Component({
  selector: 'test-client-visit-one',
  template: `
    <div>{{ foo() }}</div><div>{{ bar() }}</div><button type="button" (click)="replace()">Replace</button>
    <button type="button" (click)="replaceWithErrors({ name: 'Field is required' })">Replace with errors</button><button type="button" (click)="replaceWithErrors()">Replace without errors</button>
    <button type="button" (click)="push()">Push</button><button type="button" (click)="pushSameUrl()">Push same URL</button>
    <button type="button" (click)="defaultErrors()">Errors (default)</button><button type="button" (click)="bagErrors()">Errors (bag)</button>
    <div>Errors: {{ errorCount() }}</div><div>Finished: {{ finishedCount() }}</div><div>Success: {{ successCount() }}</div><div id="random">Random: {{ random }}</div>
  `,
})
class ClientVisitOne {
  readonly foo = input('')
  readonly bar = input('')
  readonly errorCount = signal(0)
  readonly finishedCount = signal(0)
  readonly successCount = signal(0)
  readonly random = Math.random()
  replace(): void {
    router.replace({
      preserveState: true,
      props: (props) => ({ ...props, foo: 'foo from client' }),
      onFinish: () => this.finishedCount.update((value) => value + 1),
      onSuccess: () => this.successCount.update((value) => value + 1),
    })
  }
  replaceWithErrors(errors: Record<string, string> = {}): void {
    router.replace({ preserveState: 'errors', props: (props: ClientPageProps) => ({ ...props, errors }) })
  }
  push(): void {
    router.push({ url: '/client-side-visit-2', component: 'ClientSideVisit/Page2', props: { baz: 'baz from client' } })
  }
  pushSameUrl(): void {
    router.push({
      url: '/client-side-visit',
      component: 'ClientSideVisit/Page1',
      props: (props: ClientPageProps) => ({ ...props, foo: 'foo from client' }),
    })
  }
  defaultErrors(): void {
    router.replace({
      preserveState: true,
      props: (props: ClientPageProps) => ({ ...props, errors: { foo: 'bar', baz: 'qux' } }),
      onError: (errors) => this.errorCount.set(Object.keys(errors).length),
      onFinish: () => this.finishedCount.update((value) => value + 1),
      onSuccess: () => this.successCount.update((value) => value + 1),
    })
  }
  bagErrors(): void {
    router.replace({
      preserveState: true,
      props: (props: Page['props']) => ({ ...props, errors: { bag: { foo: 'bar' } } }),
      errorBag: 'bag',
      onError: (errors) => this.errorCount.set(Object.keys(errors).length),
      onFinish: () => this.finishedCount.update((value) => value + 1),
      onSuccess: () => this.successCount.update((value) => value + 1),
    })
  }
}

@Component({ selector: 'test-client-visit-two', template: '<div>{{ baz() }}</div>' })
class ClientVisitTwo {
  readonly baz = input('')
}

type Tag = { id: number; name: string }
type User = { name: string; age: number }

@Component({
  selector: 'test-client-props',
  template: `
    <h1>Client Side Visit Props Testing</h1><div>User: {{ user()?.name || 'Unknown' }} (Age: {{ user()?.age || 'Unknown' }})</div><div>Count: {{ count() }}</div>
    <div>Items: {{ json(items()) }}</div><div>Tags: {{ json(tags()) }}</div><div>Single Value: {{ json(singleValue()) }}</div><div>Undefined Value: {{ json(undefinedValue()) }}</div>
    <button type="button" (click)="router.replaceProp('user.name', 'Jane Smith')">Replace user.name</button><button type="button" (click)="router.replaceProp('count', 10)">Replace count</button><button type="button" (click)="router.replaceProp('count', double)">Replace count (function)</button>
    <button type="button" (click)="router.appendToProp('items', 'item3')">Append to items (single)</button><button type="button" (click)="router.appendToProp('items', ['item4', 'item5'])">Append to items (multiple)</button><button type="button" (click)="router.appendToProp('tags', tagThree)">Append to tags (function)</button><button type="button" (click)="router.appendToProp('tags', tagArray)">Append array to array (objects)</button>
    <button type="button" (click)="router.prependToProp('items', 'item0')">Prepend to items (single)</button><button type="button" (click)="router.prependToProp('items', ['itemA', 'itemB'])">Prepend to items (multiple)</button><button type="button" (click)="router.prependToProp('tags', tagZero)">Prepend to tags (function)</button>
    <button type="button" (click)="router.appendToProp('singleValue', 'world')">Append to non-array (single + single)</button><button type="button" (click)="router.prependToProp('singleValue', 'hey')">Prepend to non-array (single + single)</button><button type="button" (click)="router.appendToProp('singleValue', ['there', 'world'])">Append array to non-array (single + array)</button><button type="button" (click)="router.prependToProp('singleValue', ['hey', 'hi'])">Prepend array to non-array (array + single)</button><button type="button" (click)="router.appendToProp('undefinedValue', 'new value')">Append to undefined</button><button type="button" (click)="router.prependToProp('undefinedValue', 'start value')">Prepend to undefined</button>
  `,
})
class ClientVisitProps {
  readonly items = input<string[]>([])
  readonly tags = input<Tag[]>([])
  readonly user = input<User>()
  readonly count = input(0)
  readonly singleValue = input<string | string[]>()
  readonly undefinedValue = input<string | string[]>()
  readonly router = router
  readonly double = (value: number) => value * 2
  readonly tagThree = () => ({ id: 3, name: 'tag3' })
  readonly tagZero = () => ({ id: 0, name: 'tag0' })
  readonly tagArray = [
    { id: 3, name: 'tag3' },
    { id: 4, name: 'tag4' },
  ]
  json(value: unknown): string {
    return JSON.stringify(value) ?? ''
  }
}

@Component({
  selector: 'test-identity-child',
  template:
    '<div><div [id]="prefix() + \'-render-count\'">Render count: {{ renderCount() }}</div><div [id]="prefix() + \'-value\'">Value: {{ item().label }}</div></div>',
})
class IdentityChild implements OnChanges {
  readonly prefix = input.required<string>()
  readonly item = input.required<{ label: string }>()
  readonly renderCount = signal(0)
  ngOnChanges(): void {
    this.renderCount.update((count) => count + 1)
  }
}

@Component({
  selector: 'test-replace-prop-identity',
  imports: [IdentityChild],
  template:
    '<h1>replaceProp Identity Test</h1><div id="current-value">Current value: {{ user().name }}</div><div id="profile-name">Profile name: {{ profile().name }}</div><test-identity-child prefix="memo" [item]="other()" /><test-identity-child prefix="avatar" [item]="profile().avatar" /><button type="button" (click)="router.replaceProp(\'user.name\', \'Jane Smith\')">Replace user.name</button><button type="button" (click)="router.replaceProp(\'profile.name\', \'Jane Smith\')">Replace profile.name</button>',
})
class ReplacePropIdentity {
  readonly user = input.required<{ name: string }>()
  readonly other = input.required<{ label: string }>()
  readonly profile = input.required<{ name: string; avatar: { label: string } }>()
  readonly router = router
}

@Component({
  selector: 'test-client-sequential',
  template:
    '<p>Foo: {{ foo() }}</p><p>Bar: {{ bar() }}</p><button type="button" (click)="replace()">Replace foo and bar sequentially</button>',
})
class ClientSequential {
  readonly foo = input('')
  readonly bar = input('')
  replace(): void {
    router.replaceProp('foo', 'baz')
    router.replaceProp('bar', 'qux')
  }
}

export const clientVisitPages: Record<string, ResolvedComponent> = {
  'AsyncVisits/PageA': AsyncA,
  'AsyncVisits/PageB': AsyncB,
  'AsyncVisits/PageC': AsyncC,
  'AsyncVisits/ReloadOrigin': AsyncReload,
  'ClientSideVisit/Page1': ClientVisitOne,
  'ClientSideVisit/Page2': ClientVisitTwo,
  'ClientSideVisit/Props': ClientVisitProps,
  'ClientSideVisit/ReplacePropRerender': ReplacePropIdentity,
  'ClientSideVisit/Sequential': ClientSequential,
}
