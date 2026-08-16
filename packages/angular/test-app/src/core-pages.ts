import { Component, DestroyRef, afterNextRender, inject, input } from '@angular/core'
import { Link, router, useForm, usePage, type ResolvedComponent } from '@inertiajs/angular'
import type { VisitOptions } from '@inertiajs/core'

@Component({
  selector: 'test-merge-props',
  template: `
    <div>bar count is {{ bar().length }}</div><div>foo count is {{ foo().length }}</div>
    <button type="button" (click)="router.reload({ only: ['foo'] })">Reload</button>
    <button type="button" (click)="router.reload({ reset: ['foo'] })">Get Fresh</button>
  `,
})
class MergePropsPage {
  readonly bar = input.required<number[]>()
  readonly foo = input.required<number[]>()
  readonly router = router
}

type NestedUsers = { data: Array<{ id: number; name: string }>; meta: { page: number; perPage: number } }

@Component({
  selector: 'test-merge-nested-props',
  template: `
    <p id="users">{{ names() }}</p>
    <p id="meta">Page: {{ users().meta.page }}, Per Page: {{ users().meta.perPage }}</p>
    <button type="button" (click)="loadMore()">Load More</button>
  `,
})
class MergeNestedPropsPage {
  readonly users = input.required<NestedUsers>()
  names(): string {
    return this.users()
      .data.map((user) => user.name)
      .join(', ')
  }
  loadMore(): void {
    router.reload({ only: ['users'], data: { page: this.users().meta.page + 1 } })
  }
}

type DeepFoo = { page: number; data: number[]; per_page: number; meta: { label: string } }

@Component({
  selector: 'test-deep-merge-props',
  template: `
    <div>bar count is {{ bar().length }}</div>
    <div>baz count is {{ baz().length }}</div>
    <div>foo.data count is {{ foo().data.length }}</div>
    <div>foo.page is {{ foo().page }}</div>
    <div>foo.per_page is {{ foo().per_page }}</div>
    <div>foo.meta.label is {{ foo().meta.label }}</div>
    <button type="button" (click)="reload()">Reload</button><button type="button" (click)="fresh()">Get Fresh</button>
  `,
})
class DeepMergePropsPage {
  readonly bar = input.required<number[]>()
  readonly baz = input.required<number[]>()
  readonly foo = input.required<DeepFoo>()
  reload(): void {
    router.reload({ data: { page: this.foo().page }, only: ['foo', 'baz'] })
  }
  fresh(): void {
    router.visit('/deep-merge-props', { reset: ['foo', 'baz'] })
  }
}

type MixedProp = {
  name: string
  users: string[]
  chat: { data: number[] }
  post: { id: number; comments: { allowed: boolean; data: string[] } }
}

@Component({
  selector: 'test-complex-merge-selective',
  template: `
    <div>name is {{ mixed().name }}</div><div>users: {{ mixed().users.join(', ') }}</div>
    <div>chat.data: {{ mixed().chat.data.join(', ') }}</div><div>post.id: {{ mixed().post.id }}</div>
    <div>post.comments.allowed: {{ mixed().post.comments.allowed }}</div>
    <div>post.comments.data: {{ mixed().post.comments.data.join(', ') }}</div>
    <button type="button" (click)="router.reload({ only: ['mixed'] })">Reload</button>
  `,
})
class ComplexMergeSelectivePage {
  readonly mixed = input.required<MixedProp>()
  readonly router = router
}

type NamedItem = { name: string }
type MatchFoo = {
  page: number
  data: NamedItem[]
  companies: NamedItem[]
  teams: NamedItem[]
  per_page: number
  meta: { label: string }
}

@Component({
  selector: 'test-match-props-on-key',
  template: `
    <div>bar count is {{ bar().length }}</div>
    <div>baz count is {{ baz().length }}</div>
    <div>foo.data count is {{ foo().data.length }}</div>
    <div>first foo.data name is {{ first(foo().data) }}</div>
    <div>last foo.data name is {{ last(foo().data) }}</div>
    <div>foo.companies count is {{ foo().companies.length }}</div>
    <div>first foo.companies name is {{ first(foo().companies) }}</div>
    <div>last foo.companies name is {{ last(foo().companies) }}</div>
    <div>foo.teams count is {{ foo().teams.length }}</div>
    <div>first foo.teams name is {{ first(foo().teams) }}</div>
    <div>last foo.teams name is {{ last(foo().teams) }}</div>
    <div>foo.page is {{ foo().page }}</div>
    <div>foo.per_page is {{ foo().per_page }}</div>
    <div>foo.meta.label is {{ foo().meta.label }}</div>
    <button type="button" (click)="reload()">Reload</button><button type="button" (click)="fresh()">Get Fresh</button>
  `,
})
class MatchPropsOnKeyPage {
  readonly bar = input.required<number[]>()
  readonly baz = input.required<number[]>()
  readonly foo = input.required<MatchFoo>()
  first(items: NamedItem[]): string {
    return items[0]?.name ?? ''
  }
  last(items: NamedItem[]): string {
    return items.at(-1)?.name ?? ''
  }
  reload(): void {
    router.visit('/match-props-on-key', { data: { page: this.foo().page }, only: ['foo', 'baz'] })
  }
  fresh(): void {
    router.visit('/match-props-on-key', { reset: ['foo', 'baz'] })
  }
}

@Component({
  selector: 'test-preserve-fragment',
  imports: [Link],
  template: `
    <span id="current-url">{{ page().url }}</span>
    <a inertiaLink href="/preserve-fragment/redirect#my-fragment" id="link-with-fragment">Link with fragment</a>
    <a href="#" id="manual-visit-with-fragment" (click)="visit($event)">Manual visit with fragment</a>
  `,
})
class PreserveFragmentPage {
  readonly page = usePage()
  visit(event: MouseEvent): void {
    event.preventDefault()
    router.visit('/preserve-fragment/redirect#my-fragment')
  }
}

@Component({
  selector: 'test-preserve-fragment-target',
  template: '<span id="current-url">{{ page().url }}</span><span id="target-text">This is the target page</span>',
})
class PreserveFragmentTarget {
  readonly page = usePage()
}

@Component({
  selector: 'test-scroll-smooth',
  imports: [Link],
  template: `
    <h1>{{ pageType() === 'long' ? 'Long Page' : 'Short Page' }}</h1>
    <div [style.height]="pageType() === 'long' ? '2000px' : '100px'"></div>
    <a inertiaLink [href]="pageType() === 'long' ? '/scroll-smooth/short' : '/scroll-smooth/long'"
      >Go to {{ pageType() === 'long' ? 'Short' : 'Long' }} Page</a
    >
  `,
})
class ScrollSmoothPage {
  readonly pageType = input.required<'long' | 'short'>({ alias: 'page' })
  constructor() {
    const destroyRef = inject(DestroyRef)
    afterNextRender(() => (document.documentElement.style.scrollBehavior = 'smooth'))
    destroyRef.onDestroy(() => (document.documentElement.style.scrollBehavior = ''))
  }
}

const transitionCallback: Exclude<VisitOptions['viewTransition'], boolean | undefined> = (transition) => {
  void transition.ready.then(() => console.log('ready'))
  void transition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
  void transition.finished.then(() => console.log('finished'))
}

@Component({
  selector: 'test-view-transition-a',
  imports: [Link],
  template: `
    <h1>Page A - View Transition Test</h1>
    <button type="button" (click)="booleanTransition()">Transition with boolean</button>
    <button type="button" (click)="callbackTransition()">Transition with callback</button>
    <button type="button" (click)="clientReplace()">Client-side replace</button>
    <button type="button" (click)="rapidNavigation()">Rapid navigation</button>
    <a inertiaLink href="/view-transition/page-b" [viewTransition]="transitionCallback">Link to Page B</a>
  `,
})
class ViewTransitionA {
  readonly transitionCallback = transitionCallback
  booleanTransition(): void {
    router.visit('/view-transition/page-b', { viewTransition: true })
  }
  callbackTransition(): void {
    router.visit('/view-transition/page-b', { viewTransition: transitionCallback })
  }
  clientReplace(): void {
    router.replace({
      url: '/view-transition/page-b',
      component: 'ViewTransition/PageB',
      props: {},
      viewTransition: transitionCallback,
    })
  }
  rapidNavigation(): void {
    router.replace({
      url: '/view-transition/page-b',
      component: 'ViewTransition/PageB',
      props: {},
      viewTransition: true,
    })
    router.replace({
      url: '/view-transition/page-a',
      component: 'ViewTransition/PageA',
      props: {},
      viewTransition: true,
    })
  }
}

@Component({ selector: 'test-view-transition-b', template: '<h1>Page B - View Transition Test</h1>' })
class ViewTransitionB {}

@Component({
  selector: 'test-view-transition-errors',
  template: `
    <h1>View Transition Form Errors Test</h1>
    <label>Name <input name="name" [value]="form.data().name" (input)="update($event)" /></label>
    @if (form.errors().name; as error) {
      <p class="name_error">{{ error }}</p>
    }
    <button type="button" class="submit" (click)="submit()">Submit with View Transition</button>
  `,
})
class ViewTransitionFormErrors {
  readonly form = useForm({ name: '' })
  update(event: Event): void {
    this.form.setData('name', (event.target as HTMLInputElement).value)
  }
  submit(): void {
    this.form.post('/view-transition/form-errors', { viewTransition: transitionCallback })
  }
}

export const corePages: Record<string, ResolvedComponent> = {
  MergeProps: MergePropsPage,
  MergeNestedProps: MergeNestedPropsPage,
  DeepMergeProps: DeepMergePropsPage,
  ComplexMergeSelective: ComplexMergeSelectivePage,
  MatchPropsOnKey: MatchPropsOnKeyPage,
  PreserveFragment: PreserveFragmentPage,
  'PreserveFragment/Target': PreserveFragmentTarget,
  ScrollSmooth: ScrollSmoothPage,
  'ViewTransition/PageA': ViewTransitionA,
  'ViewTransition/PageB': ViewTransitionB,
  'ViewTransition/FormErrors': ViewTransitionFormErrors,
}
