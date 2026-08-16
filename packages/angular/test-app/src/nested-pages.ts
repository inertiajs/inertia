import { Component, input } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  DeferredRescue,
  WhenVisible,
  WhenVisibleContent,
  WhenVisibleFallback,
  router,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'

const deferredImports = [Deferred, DeferredContent, DeferredFallback] as const

@Component({
  selector: 'test-nested-deferred',
  imports: [deferredImports],
  template: `
    <p id="user">User: {{ page().props.auth.user }}</p>
    <inertia-deferred data="auth.notifications"
      ><ng-template inertiaDeferredFallback><div id="loading">Loading notifications...</div></ng-template
      ><ng-template inertiaDeferredContent
        ><p id="notifications">Notifications: {{ page().props.auth.notifications?.join(', ') }}</p></ng-template
      ></inertia-deferred
    >
  `,
})
class NestedDeferred {
  readonly page = usePage<{ auth: { user?: string; notifications?: string[] } }>()
}

@Component({
  selector: 'test-nested-rescued',
  imports: [deferredImports, DeferredRescue],
  template: `
    <p id="user">User: {{ page().props.auth.user }}</p>
    <inertia-deferred data="auth.notifications">
      <ng-template inertiaDeferredFallback><div id="loading">Loading notifications...</div></ng-template>
      <ng-template inertiaDeferredRescue
        ><button id="retry" type="button" (click)="retry()">Retry auth</button></ng-template
      >
      <ng-template inertiaDeferredContent
        ><p id="notifications">Notifications: {{ page().props.auth.notifications?.join(', ') }}</p></ng-template
      >
    </inertia-deferred>
  `,
})
class NestedRescuedDeferred {
  readonly page = usePage<{ auth: { user?: string; notifications?: string[] } }>()
  retry(): void {
    router.reload({ only: ['auth'], headers: { 'X-Test-Retry': 'true' } })
  }
}

@Component({
  selector: 'test-nested-rescued-except',
  imports: [deferredImports, DeferredRescue],
  template: `
    <p id="user">User: {{ page().props.auth.user }}</p>
    <p id="token">Token: {{ page().props.auth.token }}</p>
    <p id="status">Status: {{ page().props.status }}</p>
    <inertia-deferred data="auth.notifications">
      <ng-template inertiaDeferredFallback><div id="loading">Loading notifications...</div></ng-template>
      <ng-template inertiaDeferredRescue
        ><button id="reload-except" type="button" (click)="reload()">Reload without notifications</button></ng-template
      >
      <ng-template inertiaDeferredContent
        ><p id="notifications">Notifications: {{ page().props.auth.notifications?.join(', ') }}</p></ng-template
      >
    </inertia-deferred>
  `,
})
class NestedRescuedExcept {
  readonly page = usePage<{ auth: { user?: string; token?: string; notifications?: string[] }; status: string }>()
  reload(): void {
    router.reload({ except: ['auth.notifications'], headers: { 'X-Test-Retry': 'true' } })
  }
}

type Feed = { posts: Array<{ id: number; title: string }>; meta: { page: number } }

@Component({
  selector: 'test-nested-feed',
  template: `
    <p id="posts">{{ titles() }}</p>
    <p id="meta">Page: {{ page().props.feed.meta.page }}</p>
    <button type="button" (click)="loadMore()">Load More</button>
  `,
})
class NestedFeed {
  readonly page = usePage<{ feed: Feed }>()
  titles(): string {
    return this.page()
      .props.feed.posts.map((post) => post.title)
      .join(', ')
  }
  loadMore(): void {
    router.reload({ only: ['feed'], data: { page: this.page().props.feed.meta.page + 1 } })
  }
}

@Component({
  selector: 'test-nested-once',
  template: `
    <p id="locale">Locale: {{ page().props.config.locale }}</p><p id="timezone">Timezone: {{ page().props.config.timezone }}</p>
    <button type="button" (click)="router.reload()">Reload</button><button type="button" (click)="router.reload({ only: ['config'] })">Reload only config</button>
  `,
})
class NestedOnce {
  readonly page = usePage<{ config: { locale?: string; timezone: string } }>()
  readonly router = router
}

@Component({
  selector: 'test-nested-deep-merge',
  template: `
    <p id="items">{{ names() }}</p><p id="label">Label: {{ page().props.data.label }}</p>
    <button type="button" (click)="router.reload({ only: ['data'], data: { page: 2 } })">Load More</button>
  `,
})
class NestedDeepMerge {
  readonly page = usePage<{ data: { items: Array<{ id: number; name: string }>; label: string } }>()
  readonly router = router
  names(): string {
    return this.page()
      .props.data.items.map((item) => item.name)
      .join(', ')
  }
}

@Component({
  selector: 'test-nested-shared-dot-props',
  template: `
    <p id="name">Name: {{ auth().user.name }}</p><p id="email">Email: {{ auth().user.email }}</p>
    <p id="permissions">Permissions: {{ auth().user.permissions?.join(', ') }}</p>
    <button type="button" (click)="router.reload({ only: ['auth.user.permissions'] })">Reload Permissions</button>
  `,
})
class NestedSharedDotProps {
  readonly auth = input.required<{ user: { name: string; email: string; permissions?: string[] } }>()
  readonly router = router
}

@Component({
  selector: 'test-nested-deferred-siblings',
  imports: [deferredImports],
  template: `
    <p id="user">User: {{ auth().user?.name }} ({{ auth().user?.email }})</p>
    <p id="token">Token: {{ auth().token }}</p>
    <inertia-deferred [data]="['auth.notifications', 'auth.roles']"
      ><ng-template inertiaDeferredFallback><div id="loading">Loading...</div></ng-template
      ><ng-template inertiaDeferredContent
        ><p id="notifications">Notifications: {{ page().props.auth.notifications?.join(', ') }}</p>
        <p id="roles">Roles: {{ page().props.auth.roles?.join(', ') }}</p></ng-template
      ></inertia-deferred
    >
  `,
})
class NestedDeferredSiblings {
  readonly auth = input.required<{
    user?: { name: string; email: string }
    token?: string
    notifications?: string[]
    roles?: string[]
  }>()
  readonly page = usePage<{ auth: { notifications?: string[]; roles?: string[] } }>()
}

@Component({
  selector: 'test-nested-except-dot-props',
  template: `
    <p id="user">User: {{ auth().user }}</p><p id="token">Token: {{ auth().token }}</p><p id="session-id">Session: {{ auth().sessionId }}</p>
    <button type="button" (click)="router.reload({ except: ['auth.token'] })">Reload Without Token</button>
    <button type="button" (click)="router.reload({ except: ['auth.token', 'auth.sessionId'] })">Reload Without Token and Session</button>
  `,
})
class NestedExceptDotProps {
  readonly auth = input.required<{ user: string; token?: string; sessionId?: string }>()
  readonly router = router
}

@Component({
  selector: 'test-nested-when-visible',
  imports: [WhenVisible, WhenVisibleContent, WhenVisibleFallback],
  template: `
    <div style="margin-top: 2000px; padding: 20px">
      <inertia-when-visible data="stats.visitors"
        ><ng-template inertiaWhenVisibleFallback><p id="loading">Loading visitors...</p></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><p id="visitors">Visitors: {{ page().props.stats?.visitors }}</p></ng-template
        ></inertia-when-visible
      >
    </div>
  `,
})
class NestedWhenVisible {
  readonly page = usePage<{ stats?: { visitors: number } }>()
}

export const nestedPages: Record<string, ResolvedComponent> = {
  'NestedProps/Deferred': NestedDeferred,
  'NestedProps/RescuedDeferred': NestedRescuedDeferred,
  'NestedProps/RescuedDeferredExcept': NestedRescuedExcept,
  'NestedProps/Merge': NestedFeed,
  'NestedProps/Prepend': NestedFeed,
  'NestedProps/Once': NestedOnce,
  'NestedProps/DeepMerge': NestedDeepMerge,
  'NestedProps/SharedDotProps': NestedSharedDotProps,
  'NestedProps/DeferredWithSiblings': NestedDeferredSiblings,
  'NestedProps/ExceptDotProps': NestedExceptDotProps,
  'NestedProps/WhenVisible': NestedWhenVisible,
}
