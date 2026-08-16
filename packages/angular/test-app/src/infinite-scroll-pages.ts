import { Component, Directive, afterNextRender, computed, input, signal, viewChild } from '@angular/core'
import { InfiniteScroll, usePage, type ResolvedComponent } from '@inertiajs/angular'

type User = { id: number; name: string }
type Users = { data: User[] }

@Directive()
abstract class UsersPage {
  readonly users = input<Users>({ data: [] })
}

const cards = `
  @for (user of users().data; track user.id) {
    <div [attr.data-user-id]="user.id" style="height: 15vh; border: 1px solid #ccc; color: green; display: flex; align-items: center; justify-content: center">{{ user.name }}</div>
  }
`

@Component({
  selector: 'test-infinite-trigger-both',
  imports: [InfiniteScroll],
  template: `<div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:20px">
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class TriggerBothPage extends UsersPage {}

@Component({
  selector: 'test-infinite-reverse',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    [reverse]="true"
    [autoScroll]="false"
    style="display:grid;gap:20px"
  >
    @for (user of reversed(); track user.id) {
      <div
        [attr.data-user-id]="user.id"
        style="height:15vh;border:1px solid #ccc;display:flex;align-items:center;justify-content:center"
      >
        {{ user.name }}
      </div>
    }
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class ReversePage extends UsersPage {
  readonly reversed = computed(() => [...this.users().data].reverse())
}

@Component({
  selector: 'test-infinite-short',
  imports: [InfiniteScroll],
  template: `<div inertiaInfiniteScroll="users" itemsElement="tbody">
    <table>
      <tbody>
        @for (user of users().data; track user.id) {
          <tr [attr.data-user-id]="user.id">
            <td>{{ user.id }}</td>
            <td style="padding:10px;border:1px solid #ccc">{{ user.name }}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>`,
})
class ShortContentPage extends UsersPage {}

@Component({
  selector: 'test-infinite-reverse-short',
  imports: [InfiniteScroll],
  template: `<div style="display:flex;flex-direction:column;height:100vh">
    <div>Header</div>
    <div data-testid="scroll-container" style="flex:1;overflow-y:auto">
      <div
        inertiaInfiniteScroll="users"
        #scroll="inertiaInfiniteScroll"
        [reverse]="true"
        style="display:grid;gap:4px;padding:20px"
      >
        @for (user of reversed(); track user.id) {
          <div [attr.data-user-id]="user.id" style="padding:4px 8px;border:1px solid #ddd">{{ user.name }}</div>
        }
        @if (scroll.loading()) {
          <div>Loading...</div>
        }
      </div>
    </div>
    <div>Footer</div>
  </div>`,
})
class ReverseShortContentPage extends UsersPage {
  readonly reversed = computed(() => [...this.users().data].reverse())
}

@Component({
  selector: 'test-infinite-dual-containers',
  imports: [InfiniteScroll],
  template: `<div style="display:flex;gap:20px">
    <div data-testid="scroll-container-1" style="height:400px;flex:1;overflow-y:auto;padding:10px">
      <div inertiaInfiniteScroll="users1" style="display:grid;gap:10px">
        @for (user of users1().data; track user.id) {
          <div [attr.data-user-id]="user.id" style="height:15vh;border:1px solid #ccc">{{ user.name }}</div>
        }
      </div>
    </div>
    <div data-testid="scroll-container-2" style="height:400px;flex:1;overflow-y:auto;padding:10px">
      <div inertiaInfiniteScroll="users2" style="display:grid;gap:10px">
        @for (user of users2().data; track user.id) {
          <div [attr.data-user-id]="user.id" style="height:15vh;border:1px solid #ccc">{{ user.name }}</div>
        }
      </div>
    </div>
  </div>`,
})
class DualContainersPage {
  readonly users1 = input<Users>({ data: [] })
  readonly users2 = input<Users>({ data: [] })
}

@Component({
  selector: 'test-infinite-dual-sibling',
  imports: [InfiniteScroll],
  template: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      <div inertiaInfiniteScroll="users1" #first="inertiaInfiniteScroll" [manual]="true" style="display:grid;gap:20px">
        @for (user of users1().data; track user.id) {
          <div [attr.data-user-id]="user.id" style="height:15vh;border:1px solid #ccc">{{ user.name }}</div>
        }
        <button type="button" (click)="first.fetchNext()" [disabled]="first.loadingNext()">
          {{ first.loadingNext() ? 'Loading...' : 'Load More Users 1' }}
        </button>
      </div>
    </div>
    <div>
      <div inertiaInfiniteScroll="users2" #second="inertiaInfiniteScroll" [manual]="true" style="display:grid;gap:20px">
        @for (user of users2().data; track user.id) {
          <div [attr.data-user-id]="user.id" style="height:15vh;border:1px solid #ccc">{{ user.name }}</div>
        }
        <button type="button" (click)="second.fetchNext()" [disabled]="second.loadingNext()">
          {{ second.loadingNext() ? 'Loading...' : 'Load More Users 2' }}
        </button>
      </div>
    </div>
  </div>`,
})
class DualSiblingPage {
  readonly users1 = input<Users>({ data: [] })
  readonly users2 = input<Users>({ data: [] })
}

@Component({
  selector: 'test-infinite-manual',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    [manual]="true"
    style="display:grid;gap:20px"
  >
    <p>Has more previous items: {{ scroll.hasPreviousPage() }}</p>
    <button type="button" (click)="scroll.fetchPrevious()">
      {{ scroll.loadingPrevious() ? 'Loading previous items...' : 'Load previous items' }}
    </button>
    ${cards}
    <p>Has more next items: {{ scroll.hasNextPage() }}</p>
    <button type="button" (click)="scroll.fetchNext()">
      {{ scroll.loadingNext() ? 'Loading next items...' : 'Load next items' }}
    </button>
  </div>`,
})
class ManualPage extends UsersPage {}

@Component({
  selector: 'test-infinite-manual-after',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    [manualAfter]="2"
    style="display:grid;gap:20px"
  >
    ${cards}
    @if (scroll.loading()) {
      <p>Loading...</p>
    }
    <p>Manual mode: {{ scroll.manualMode() }}</p>
    @if (scroll.manualMode()) {
      <button type="button" (click)="scroll.fetchNext()">Load next items</button>
    }
  </div>`,
})
class ManualAfterPage extends UsersPage {}

@Component({
  selector: 'test-infinite-toggles',
  imports: [InfiniteScroll],
  template: `<label
      ><input type="checkbox" [checked]="manual()" (change)="setManual($event)" /> Manual mode: {{ manual() }}</label
    >
    <label
      ><input type="checkbox" [checked]="preserveUrl()" (change)="setPreserve($event)" /> Preserve URL:
      {{ preserveUrl() }}</label
    >
    <label
      >Trigger mode: {{ triggerMode() }}
      <select [value]="triggerMode()" (change)="setTrigger($event)">
        <option>onlyPrevious</option>
        <option>onlyNext</option>
        <option>both</option>
      </select></label
    >
    <div
      inertiaInfiniteScroll="users"
      #scroll="inertiaInfiniteScroll"
      [manual]="manual()"
      [preserveUrl]="preserveUrl()"
      [onlyNext]="triggerMode() === 'onlyNext'"
      [onlyPrevious]="triggerMode() === 'onlyPrevious'"
      style="display:grid;gap:20px"
    >
      ${cards}
      @if (scroll.loading()) {
        <div>Loading...</div>
      }
    </div>
    <p>Total items on page: {{ users().data.length }}</p>`,
})
class TogglesPage extends UsersPage {
  readonly manual = signal(false)
  readonly preserveUrl = signal(false)
  readonly triggerMode = signal<'onlyPrevious' | 'onlyNext' | 'both'>('onlyNext')
  setManual(event: Event): void {
    this.manual.set((event.target as HTMLInputElement).checked)
  }
  setPreserve(event: Event): void {
    this.preserveUrl.set((event.target as HTMLInputElement).checked)
  }
  setTrigger(event: Event): void {
    this.triggerMode.set((event.target as HTMLSelectElement).value as 'onlyPrevious' | 'onlyNext' | 'both')
  }
}

@Component({
  selector: 'test-infinite-end-buffer',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    [buffer]="200"
    [onlyNext]="true"
    style="display:grid;gap:20px"
  >
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class TriggerEndBufferPage extends UsersPage {}

@Component({
  selector: 'test-infinite-start-buffer',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    [buffer]="200"
    [onlyPrevious]="true"
    style="display:grid;gap:20px"
  >
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class TriggerStartBufferPage extends UsersPage {}

@Component({
  selector: 'test-infinite-update-query',
  imports: [InfiniteScroll],
  template: `<div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:20px">
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class UpdateQueryStringPage extends UsersPage {
  readonly page = usePage()
  constructor() {
    super()
    Object.defineProperty(window.testing, 'pageUrl', { configurable: true, get: () => this.page().url })
  }
}

@Component({
  selector: 'test-infinite-preserve-url',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    [preserveUrl]="true"
    style="display:grid;gap:20px"
  >
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class PreserveUrlPage extends UsersPage {}

@Component({
  selector: 'test-infinite-container',
  imports: [InfiniteScroll],
  template: `<h1>Infinite Scroll in Container</h1>
    <div data-testid="scroll-container" style="height:400px;width:100%;overflow-y:auto;padding:10px">
      <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:10px">
        ${cards}
        @if (scroll.loading()) {
          <div>Loading more users...</div>
        }
      </div>
    </div>`,
})
class ScrollContainerPage extends UsersPage {}

@Component({
  selector: 'test-infinite-invisible-first',
  imports: [InfiniteScroll],
  template: `<div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:grid;gap:20px">
    <div style="display:none">Hidden first element</div>
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </div>`,
})
class InvisibleFirstChildPage extends UsersPage {}

@Component({
  selector: 'test-infinite-overflow-x',
  imports: [InfiniteScroll],
  template: `<div style="overflow-x:hidden">
    <div inertiaInfiniteScroll="users">
      @for (user of users().data; track user.id) {
        <div [attr.data-user-id]="user.id">{{ user.name }}</div>
      }
    </div>
  </div>`,
})
class OverflowXPage extends UsersPage {}

@Component({
  selector: 'test-infinite-horizontal',
  imports: [InfiniteScroll],
  template: `<div style="height:120px;overflow-x:scroll;display:flex;width:100vw">
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" style="display:flex;gap:20px;height:120px">
      @for (user of users().data; track user.id) {
        <div
          [attr.data-user-id]="user.id"
          style="min-width:200px;height:100px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;flex:none"
        >
          {{ user.name }}
        </div>
      }
      @if (scroll.loading()) {
        <div style="min-width:150px">Loading...</div>
      }
    </div>
  </div>`,
})
class HorizontalScrollPage extends UsersPage {}

@Component({
  selector: 'test-infinite-programmatic',
  imports: [InfiniteScroll],
  template: `<p>Has more previous items: {{ hasPrevious() }}</p>
    <p>Has more next items: {{ hasNext() }}</p>
    <button type="button" (click)="fetchPrevious()">Load Previous (Ref)</button
    ><button type="button" (click)="fetchNext()">Load Next (Ref)</button>
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" [manual]="true" style="display:grid;gap:20px">
      ${cards}
      @if (scroll.loading()) {
        <div>Loading...</div>
      }
    </div>`,
})
class ProgrammaticRefPage extends UsersPage {
  readonly scroll = viewChild.required(InfiniteScroll)
  readonly hasPrevious = signal(false)
  readonly hasNext = signal(false)
  constructor() {
    super()
    afterNextRender(() => this.update())
  }
  update(): void {
    this.hasPrevious.set(this.scroll().hasPrevious())
    this.hasNext.set(this.scroll().hasNext())
  }
  fetchPrevious(): void {
    this.scroll().fetchPrevious({ onFinish: () => this.update() })
  }
  fetchNext(): void {
    this.scroll().fetchNext({ onFinish: () => this.update() })
  }
}

@Component({
  selector: 'test-infinite-grid',
  imports: [InfiniteScroll],
  template: `<div
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px"
  >
    ${cards}
    @if (scroll.loading()) {
      <div>Loading more users...</div>
    }
  </div>`,
})
class GridPage extends UsersPage {}

@Component({
  selector: 'test-infinite-table',
  imports: [InfiniteScroll],
  template: `<div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll" itemsElement="tbody">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        @for (user of users().data; track user.id) {
          <tr [attr.data-user-id]="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
          </tr>
        }
      </tbody>
      <tfoot>
        @if (scroll.loading()) {
          <tr>
            <td colspan="2">Loading...</td>
          </tr>
        }
      </tfoot>
    </table>
  </div>`,
})
class DataTablePage extends UsersPage {}

@Component({
  selector: 'test-infinite-empty',
  imports: [InfiniteScroll],
  template: `<h1>Empty Dataset Test</h1>
    <div inertiaInfiniteScroll="users" #scroll="inertiaInfiniteScroll">
      ${cards}
      @if (users().data.length === 0) {
        <div>No users found.</div>
      }
      @if (scroll.loading()) {
        <div>Loading...</div>
      }
    </div>`,
})
class EmptyPage extends UsersPage {}

@Component({
  selector: 'test-infinite-custom-element',
  imports: [InfiniteScroll],
  template: `<section
    data-testid="infinite-scroll-container"
    inertiaInfiniteScroll="users"
    #scroll="inertiaInfiniteScroll"
    style="display:grid;gap:20px"
  >
    ${cards}
    @if (scroll.loading()) {
      <div>Loading...</div>
    }
  </section>`,
})
class CustomElementPage extends UsersPage {}

export const infiniteScrollPages: Record<string, ResolvedComponent> = {
  'InfiniteScroll/TriggerBoth': TriggerBothPage,
  'InfiniteScroll/Reverse': ReversePage,
  'InfiniteScroll/ShortContent': ShortContentPage,
  'InfiniteScroll/ReverseShortContent': ReverseShortContentPage,
  'InfiniteScroll/DualContainers': DualContainersPage,
  'InfiniteScroll/DualSibling': DualSiblingPage,
  'InfiniteScroll/Manual': ManualPage,
  'InfiniteScroll/ManualAfter': ManualAfterPage,
  'InfiniteScroll/Toggles': TogglesPage,
  'InfiniteScroll/TriggerEndBuffer': TriggerEndBufferPage,
  'InfiniteScroll/TriggerStartBuffer': TriggerStartBufferPage,
  'InfiniteScroll/UpdateQueryString': UpdateQueryStringPage,
  'InfiniteScroll/PreserveUrl': PreserveUrlPage,
  'InfiniteScroll/ScrollContainer': ScrollContainerPage,
  'InfiniteScroll/InvisibleFirstChild': InvisibleFirstChildPage,
  'InfiniteScroll/OverflowX': OverflowXPage,
  'InfiniteScroll/HorizontalScroll': HorizontalScrollPage,
  'InfiniteScroll/ProgrammaticRef': ProgrammaticRefPage,
  'InfiniteScroll/Grid': GridPage,
  'InfiniteScroll/DataTable': DataTablePage,
  'InfiniteScroll/Empty': EmptyPage,
  'InfiniteScroll/CustomElement': CustomElementPage,
}
