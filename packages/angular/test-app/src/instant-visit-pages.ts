import { Component, input } from '@angular/core'
import { Deferred, DeferredContent, DeferredFallback, Link, router, type ResolvedComponent } from '@inertiajs/angular'
import type { Errors, UrlMethodPair } from '@inertiajs/core'

@Component({
  selector: 'test-instant-visit-page-one',
  imports: [Link],
  template: `
    <div id="page1">This is Page1</div>
    <div>Foo: {{ foo() }}</div>
    <div id="auth">Auth: {{ auth()?.user ?? 'none' }}</div>
    <div id="errors">Errors: {{ errorText() }}</div>

    <button type="button" (click)="submitForm()">Submit form</button>
    <button type="button" (click)="visitWithComponent()">Visit with component</button>
    <button type="button" (click)="visitWithComponentAndPreserveScroll()">
      Visit with component and preserve scroll
    </button>
    <button type="button" (click)="visitWithComponentAndPageProps()">Visit with component and pageProps</button>
    <button type="button" (click)="visitWithPagePropsCallback()">Visit with pageProps callback</button>
    <button type="button" (click)="visitWithPagePropsCallbackUsingShared()">
      Visit with pageProps callback using shared
    </button>
    <button type="button" (click)="visitRedirecting()">Visit redirecting</button>
    <button type="button" (click)="visitDeferred()">Visit deferred</button>

    <a inertiaLink href="/instant-visit/target?delay=500" component="InstantVisit/Target">Link with component</a>
    <a inertiaLink [href]="instantHref" [instant]="true">Link with instant</a>
    <a inertiaLink [href]="arrayHref" [instant]="true" component="InstantVisit/Target">
      Link with array component and explicit override
    </a>
    <a inertiaLink [href]="arrayHref" [instant]="true">Link with array component</a>

    <hr style="padding: 500px 0" />
    <div id="after-scroll">After scroll</div>
  `,
})
class InstantVisitPageOne {
  readonly foo = input('')
  readonly auth = input<{ user: string }>()
  readonly errors = input<Errors>({})
  readonly instantHref: UrlMethodPair = {
    url: '/instant-visit/target?delay=500',
    method: 'get',
    component: 'InstantVisit/Target',
  }
  readonly arrayHref: UrlMethodPair = {
    url: '/instant-visit/target?delay=500',
    method: 'get',
    component: {
      'InstantVisit/Target': 'InstantVisit/Target',
      'InstantVisit/Other': 'InstantVisit/Other',
    },
  }

  errorText(): string {
    const errors = this.errors()
    return Object.keys(errors).length > 0 ? JSON.stringify(errors) : 'none'
  }

  submitForm(): void {
    router.post('/instant-visit')
  }

  visitWithComponent(): void {
    router.visit('/instant-visit/target?delay=500', { component: 'InstantVisit/Target' })
  }

  visitWithComponentAndPreserveScroll(): void {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      preserveScroll: true,
    })
  }

  visitWithComponentAndPageProps(): void {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      pageProps: { greeting: 'Placeholder greeting' },
    })
  }

  visitWithPagePropsCallback(): void {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      pageProps: (currentProps) => ({ greeting: `Was on page with foo: ${String(currentProps['foo'])}` }),
    })
  }

  visitWithPagePropsCallbackUsingShared(): void {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      pageProps: (_currentProps, sharedProps) => ({ ...sharedProps, greeting: 'Placeholder with shared' }),
    })
  }

  visitRedirecting(): void {
    router.visit('/instant-visit/redirecting?delay=500', { component: 'InstantVisit/Target' })
  }

  visitDeferred(): void {
    router.visit('/instant-visit/deferred?delay=500', {
      component: 'InstantVisit/Deferred',
      pageProps: { title: 'Placeholder Title' },
    })
  }
}

@Component({
  selector: 'test-instant-visit-target',
  template: `
    <div id="target">This is Target</div>
    <div id="greeting">Greeting: {{ greeting() ?? 'none' }}</div>
    <div id="timestamp">Timestamp: {{ timestamp() ?? 'none' }}</div>
    <div id="auth">Auth: {{ auth()?.user ?? 'none' }}</div>
    <div id="errors">Errors: {{ errorText() }}</div>
    <hr style="padding: 500px 0" />
    <div id="after-scroll">After scroll</div>
  `,
})
class InstantVisitTarget {
  readonly greeting = input<string>()
  readonly timestamp = input<number>()
  readonly auth = input<{ user: string }>()
  readonly errors = input<Errors>({})

  errorText(): string {
    const errors = this.errors()
    return Object.keys(errors).length > 0 ? JSON.stringify(errors) : 'none'
  }
}

@Component({
  selector: 'test-instant-visit-redirect-target',
  template: `
    <div id="redirect-target">This is RedirectTarget</div>
    <div id="redirected">Redirected: {{ redirected() }}</div>
  `,
})
class InstantVisitRedirectTarget {
  readonly redirected = input(false)
}

@Component({
  selector: 'test-instant-visit-deferred',
  imports: [Deferred, DeferredContent, DeferredFallback],
  template: `
    <div id="deferred">This is Deferred</div>
    <div id="title">Title: {{ title() ?? 'none' }}</div>
    <inertia-deferred data="heavyData">
      <ng-template inertiaDeferredFallback><div id="heavy-loading">Loading heavy data...</div></ng-template>
      <ng-template inertiaDeferredContent
        ><div id="heavy-data">Heavy: {{ heavyData() }}</div></ng-template
      >
    </inertia-deferred>
  `,
})
class InstantVisitDeferred {
  readonly title = input<string>()
  readonly heavyData = input<string>()
}

export const instantVisitPages: Record<string, ResolvedComponent> = {
  'InstantVisit/Page1': InstantVisitPageOne,
  'InstantVisit/Target': InstantVisitTarget,
  'InstantVisit/RedirectTarget': InstantVisitRedirectTarget,
  'InstantVisit/Deferred': InstantVisitDeferred,
}
