import {
  ApplicationRef,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  InfiniteScroll,
  Link,
  WhenVisible,
  WhenVisibleContent,
  WhenVisibleFallback,
  router,
  useForm,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'

type User = { id: number; name: string }
type Users = { data: User[] }

const userCards = `
  @for (user of users().data; track user.id) {
    <div [attr.data-user-id]="user.id" style="height:15vh;border:1px solid #ccc;color:green;display:flex;align-items:center;justify-content:center">{{ user.name }}</div>
  }
`

const manualActions = `
  <p>Has more previous items: {{ scroll.hasPreviousPage() }}</p>
  <button type="button" (click)="scroll.fetchPrevious()">{{ scroll.loadingPrevious() ? 'Loading previous items...' : 'Load previous items' }}</button>
  ${userCards}
  <p>Has more next items: {{ scroll.hasNextPage() }}</p>
  <button type="button" (click)="scroll.fetchNext()">{{ scroll.loadingNext() ? 'Loading next items...' : 'Load next items' }}</button>
`

@Component({
  selector: 'test-infinite-filtering-manual',
  imports: [InfiniteScroll],
  template: `
    <div>Current search: {{ search() || 'none' }}</div>
    <input placeholder="Search..." [value]="form.data().search" (input)="updateSearch($event)" />
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" [manual]="true" style="display:grid;gap:20px">
      ${manualActions}
    </div>
  `,
})
class FilteringManualPage implements OnDestroy {
  readonly users = input<Users>({ data: [] })
  readonly search = input('')
  readonly page = usePage<{ search?: string }>()
  readonly form = useForm(() => ({ search: this.page().props.search ?? '' }))
  #timer: ReturnType<typeof setTimeout> | undefined

  updateSearch(event: Event): void {
    this.form.setData('search', (event.target as HTMLInputElement).value)
    clearTimeout(this.#timer)
    this.#timer = setTimeout(
      () =>
        this.form.get('', {
          preserveState: true,
          replace: true,
          only: ['users', 'search'],
          reset: ['users'],
        }),
      250,
    )
  }

  ngOnDestroy(): void {
    clearTimeout(this.#timer)
  }
}

@Component({
  selector: 'test-infinite-remember-state',
  imports: [InfiniteScroll, Link],
  template: `
    <div style="margin-bottom:40px;padding:20px;border-top:2px solid #ccc">
      <button type="button" (click)="prepend(0)">Prepend User '0'</button>
      <button type="button" (click)="prepend(-1)">Prepend User '-1'</button>
      <a inertiaLink href="/home">Go Home</a>
    </div>
    <div
      inertiaInfiniteScroll="users"
      #scroll="inertiaInfiniteScroll"
      [manualAfter]="2"
      itemsElement="#remember-users"
      style="display:grid;gap:20px"
    >
      <div id="remember-users" style="display:grid;gap:20px">${userCards}</div>
      @if (scroll.loading()) {
        <p>Loading...</p>
      }
      <p>Manual mode: {{ scroll.manualMode() }}</p>
      @if (scroll.manualMode()) {
        <button type="button" (click)="scroll.fetchNext()">Load next items...</button>
      }
    </div>
    <div style="margin-top:40px;padding:20px;border-top:2px solid #ccc"><a inertiaLink href="/home">Go to Home</a></div>
  `,
})
class RememberStatePage {
  readonly users = input<Users>({ data: [] })
  prepend(id: number): void {
    router.prependToProp('users.data', { id, name: `User ${id}` })
  }
}

@Component({
  selector: 'test-infinite-manual-reverse',
  imports: [InfiniteScroll],
  template: `
    <div
      inertiaInfiniteScroll="users"
      #scroll="inertiaInfiniteScroll"
      [reverse]="true"
      [onlyNext]="true"
      itemsElement="#manual-reverse-users"
      style="display:grid;gap:20px"
    >
      @if (scroll.hasNextPage()) {
        <button type="button" (click)="scroll.fetchNext()">
          Load next page (rendered at the start because of reverse mode)
        </button>
      }
      <div id="manual-reverse-users" style="display:grid;gap:20px">
        @for (user of reversedUsers(); track user.id) {
          <div [attr.data-user-id]="user.id" style="height:15vh;border:1px solid #ccc">{{ user.name }}</div>
        }
      </div>
      @if (scroll.hasPreviousPage()) {
        <button type="button" (click)="scroll.fetchPrevious()">
          Load previous page (rendered at the end because of reverse mode)
        </button>
      }
    </div>
  `,
})
class ManualReversePage {
  readonly users = input<Users>({ data: [] })
  readonly reversedUsers = computed(() => [...this.users().data].reverse())
}

@Component({
  selector: 'test-infinite-custom-triggers',
  imports: [InfiniteScroll],
  template: `
    <div
      style="padding:20px"
      inertiaInfiniteScroll="users"
      #scroll="inertiaInfiniteScroll"
      startElement="#table-header"
      endElement="#table-footer"
      itemsElement="#table-body"
    >
      <div style="height:300px;width:100%;text-align:center;line-height:300px;border:1px solid #ccc">Spacer</div>
      <table style="width:100%;border-collapse:collapse">
        <thead id="table-header">
          <tr>
            <th style="padding:12px;border:1px solid #ccc">ID</th>
            <th style="padding:12px;border:1px solid #ccc">Name</th>
          </tr>
        </thead>
        <tbody id="table-body">
          @for (user of users().data; track user.id) {
            <tr [attr.data-user-id]="user.id">
              <td style="padding:80px 12px;border:1px solid #ccc">{{ user.id }}</td>
              <td style="padding:80px 12px;border:1px solid #ccc">{{ user.name }}</td>
            </tr>
          }
          @if (scroll.loading()) {
            <tr>
              <td colspan="2" style="padding:12px;text-align:center">Loading...</td>
            </tr>
          }
        </tbody>
        <tfoot id="table-footer">
          <tr>
            <td colspan="2" style="padding:12px;text-align:center">
              Table Footer - Triggers when this comes into view
            </td>
          </tr>
        </tfoot>
      </table>
      <div style="height:300px;width:100%;text-align:center;line-height:300px;border:1px solid #ccc">Spacer</div>
    </div>
  `,
})
class CustomTriggersPage {
  readonly users = input<Users>({ data: [] })
}

@Component({
  selector: 'test-infinite-filtering',
  imports: [InfiniteScroll, Link],
  template: `
    <div>
      <div style="margin-bottom:20px;display:flex;gap:10px">
        <a inertiaLink href="">No Filter</a><a inertiaLink href="?filter=a-m">A-M</a
        ><a inertiaLink href="?filter=n-z">N-Z</a>
        <div>Current filter: {{ filter() || 'none' }}</div>
        <div>Current search: {{ search() || 'none' }}</div>
        <input placeholder="Search..." [value]="form.data().search" (input)="updateSearch($event)" />
      </div>
      <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:20px">
        ${userCards}
        @if (scroll.loading()) {
          <div>Loading...</div>
        }
      </div>
      <div style="margin-top:20px;display:flex;gap:10px">
        <a inertiaLink href="">No Filter</a><a inertiaLink href="?filter=a-m">A-M</a
        ><a inertiaLink href="?filter=n-z">N-Z</a>
        <div>Current filter: {{ filter() || 'none' }}</div>
        <div>Current search: {{ search() || 'none' }}</div>
        <input placeholder="Search..." [value]="form.data().search" (input)="updateSearch($event)" />
      </div>
    </div>
  `,
})
class FilteringPage implements OnDestroy {
  readonly users = input<Users>({ data: [] })
  readonly preserveState = input(false)
  readonly filter = input('')
  readonly search = input('')
  readonly page = usePage<{ search?: string }>()
  readonly form = useForm(() => ({ filter: undefined, page: undefined, search: this.page().props.search ?? '' }))
  #timer: ReturnType<typeof setTimeout> | undefined

  updateSearch(event: Event): void {
    this.form.setData('search', (event.target as HTMLInputElement).value)
    clearTimeout(this.#timer)
    this.#timer = setTimeout(() => {
      this.form.get(
        '',
        this.preserveState()
          ? { preserveState: true, replace: true, only: ['users', 'search', 'filter'], reset: ['users'] }
          : { replace: true },
      )
    }, 250)
  }

  ngOnDestroy(): void {
    clearTimeout(this.#timer)
  }
}

@Component({
  selector: 'test-infinite-filtering-reset',
  imports: [InfiniteScroll],
  template: `
    <div>Current search: {{ search() || 'none' }}</div>
    <input placeholder="Search..." [value]="form.data().search" (input)="updateSearch($event)" />
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" [buffer]="2000" style="display:grid;gap:20px">
      ${userCards}
      @if (scroll.loading()) {
        <div>Loading...</div>
      }
    </div>
  `,
})
class FilteringResetPage implements OnDestroy {
  readonly users = input<Users>({ data: [] })
  readonly search = input('')
  readonly page = usePage<{ search?: string }>()
  readonly form = useForm(() => ({ search: this.page().props.search ?? '' }))
  #timer: ReturnType<typeof setTimeout> | undefined

  updateSearch(event: Event): void {
    this.form.setData('search', (event.target as HTMLInputElement).value)
    clearTimeout(this.#timer)
    this.#timer = setTimeout(
      () => this.form.get('', { preserveState: true, replace: true, only: ['users', 'search'], reset: ['users'] }),
      250,
    )
  }

  ngOnDestroy(): void {
    clearTimeout(this.#timer)
  }
}

@Component({
  selector: 'test-infinite-reload-unrelated',
  imports: [InfiniteScroll],
  template: `
    <button id="reload-button" type="button" (click)="reload()">Reload Time</button
    ><span id="time-display">Current time: {{ time() }}</span>
    <div inertiaInfiniteScroll="users">${userCards}</div>
  `,
})
class ReloadUnrelatedPage {
  readonly users = input<Users>({ data: [] })
  readonly time = input(0)
  reload(): void {
    router.reload({ only: ['time'] })
  }
}

@Component({
  selector: 'test-infinite-links',
  imports: [Link],
  template: `<a inertiaLink href="/infinite-scroll-with-link">Go to InfiniteScrollWithLink</a
    ><a inertiaLink href="/infinite-scroll-with-link" [prefetch]="true">Go to InfiniteScrollWithLink (Prefetch)</a>`,
})
class LinksPage {}

@Component({
  selector: 'test-infinite-with-link',
  imports: [InfiniteScroll, Link],
  template: `<a inertiaLink href="/infinite-scroll">Go back to Links</a>
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:20px">
      ${userCards}
      @if (scroll.loading()) {
        <div>Loading...</div>
      }
    </div>`,
})
class InfiniteScrollWithLinkPage {
  readonly users = input<Users>({ data: [] })
}

const deferredImports = [Deferred, DeferredContent, DeferredFallback] as const

@Component({
  selector: 'test-infinite-deferred',
  imports: [deferredImports, InfiniteScroll],
  template: `
    <inertia-deferred data="users">
      <ng-template inertiaDeferredFallback><div>Loading deferred scroll prop...</div></ng-template>
      <ng-template inertiaDeferredContent>
        <div
          inertiaInfiniteScroll="users"
          #scroll="inertiaInfiniteScroll"
          [manual]="true"
          style="display:grid;gap:20px"
        >
          ${manualActions}
        </div>
      </ng-template>
    </inertia-deferred>
  `,
})
class DeferredPage {
  readonly users = input<Users>({ data: [] })
}

const visibleImports = [WhenVisible, WhenVisibleContent, WhenVisibleFallback] as const

@Component({
  selector: 'test-infinite-optional-visible',
  imports: [visibleImports, InfiniteScroll],
  template: `
    <h1>Optional Scroll Prop + WhenVisible</h1>
    <div id="initial-state">Users prop present: {{ page().props.users !== undefined }}</div>
    <div style="margin-top:2000px">
      <inertia-when-visible data="users">
        <ng-template inertiaWhenVisibleFallback><div>Loading optional scroll prop...</div></ng-template>
        <ng-template inertiaWhenVisibleContent>
          <div
            inertiaInfiniteScroll="users"
            #scroll="inertiaInfiniteScroll"
            [manual]="true"
            style="display:grid;gap:20px"
          >
            ${manualActions}
          </div>
        </ng-template>
      </inertia-when-visible>
    </div>
  `,
})
class OptionalWhenVisiblePage {
  readonly users = input<Users>({ data: [] })
  readonly page = usePage<{ users?: Users }>()
}

@Component({
  selector: 'test-infinite-navigate-away',
  imports: [InfiniteScroll, Link],
  template: `<a inertiaLink href="/article" id="leave">Leave to /article</a>
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:20px">
      ${userCards}
      @if (scroll.loading()) {
        <div>Loading...</div>
      }
    </div>`,
})
class NavigateAwayPage {
  readonly users = input<Users>({ data: [] })
}

@Component({
  selector: 'test-infinite-preserve-errors',
  imports: [InfiniteScroll],
  template: `
    @if (page().props.errors.name; as error) {
      <p id="page-error">{{ error }}</p>
    }
    @if (form.errors().name; as error) {
      <p id="form-error">{{ error }}</p>
    }
    <button type="button" (click)="form.post('/infinite-scroll/preserve-errors')">Submit</button>
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" [manual]="true" style="display:grid;gap:20px">
      @if (scroll.hasPreviousPage()) {
        <button id="load-previous" type="button" (click)="scroll.fetchPrevious()">
          {{ scroll.loadingPrevious() ? 'Loading previous items...' : 'Load previous items' }}
        </button>
      }
      ${userCards}
      @if (scroll.hasNextPage()) {
        <button id="load-next" type="button" (click)="scroll.fetchNext()">
          {{ scroll.loadingNext() ? 'Loading next items...' : 'Load next items' }}
        </button>
      }
    </div>
  `,
})
class PreserveErrorsPage {
  readonly users = input<Users>({ data: [] })
  readonly page = usePage<{ errors?: { name?: string } }>()
  readonly form = useForm({ name: '' })
}

@Component({ selector: 'test-infinite-lifecycle-marker', template: '<span style="display:none"></span>' })
class LifecycleMarker implements OnInit, OnDestroy {
  ngOnInit(): void {
    console.log('marker mounted')
  }
  ngOnDestroy(): void {
    console.log('marker destroyed')
  }
}

@Component({
  selector: 'test-infinite-unmount-race',
  imports: [InfiniteScroll, LifecycleMarker],
  template: `
    <button type="button" (click)="cycleMount()">Cycle Mount</button>
    <p id="cycle-count">Cycles: {{ cycleCount() }}</p>
    @if (show()) {
      <test-infinite-lifecycle-marker />
      <div inertiaInfiniteScroll="users" style="display:grid;gap:20px">${userCards}</div>
    }
  `,
})
class UnmountRacePage {
  readonly users = input<Users>({ data: [] })
  readonly show = signal(false)
  readonly cycleCount = signal(0)
  readonly #appRef = inject(ApplicationRef)
  readonly #destroyRef = inject(DestroyRef)

  cycleMount(): void {
    this.show.set(true)
    this.#appRef.tick()
    queueMicrotask(() => {
      if (this.#destroyRef.destroyed) return
      this.show.set(false)
      this.cycleCount.update((count) => count + 1)
      this.#appRef.tick()
    })
  }
}

export const infiniteScrollAdvancedPages: Record<string, ResolvedComponent> = {
  'InfiniteScroll/FilteringManual': FilteringManualPage,
  'InfiniteScroll/RememberState': RememberStatePage,
  'InfiniteScroll/ManualReverse': ManualReversePage,
  'InfiniteScroll/CustomTriggersRef': CustomTriggersPage,
  'InfiniteScroll/CustomTriggersSelector': CustomTriggersPage,
  'InfiniteScroll/CustomTriggersRefObject': CustomTriggersPage,
  'InfiniteScroll/Filtering': FilteringPage,
  'InfiniteScroll/FilteringReset': FilteringResetPage,
  'InfiniteScroll/ReloadUnrelated': ReloadUnrelatedPage,
  'InfiniteScroll/Links': LinksPage,
  'InfiniteScroll/InfiniteScrollWithLink': InfiniteScrollWithLinkPage,
  'InfiniteScroll/Deferred': DeferredPage,
  'InfiniteScroll/OptionalWhenVisible': OptionalWhenVisiblePage,
  'InfiniteScroll/NavigateAway': NavigateAwayPage,
  'InfiniteScroll/PreserveErrors': PreserveErrorsPage,
  'InfiniteScroll/UnmountRace': UnmountRacePage,
}
