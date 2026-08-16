import { Component, computed, input, signal } from '@angular/core'
import {
  Link,
  WhenVisible,
  WhenVisibleContent,
  WhenVisibleFallback,
  router,
  useForm,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'
import type { ReloadOptions } from '@inertiajs/core'

const visibleImports = [WhenVisible, WhenVisibleContent, WhenVisibleFallback] as const
type LazyData = { text: string }

@Component({
  selector: 'test-when-visible',
  imports: [visibleImports],
  template: `
    <div style="margin-top: 5000px">
      <inertia-when-visible data="foo"
        ><ng-template inertiaWhenVisibleFallback><div>Loading first one...</div></ng-template
        ><ng-template inertiaWhenVisibleContent><div>First one is visible!</div></ng-template></inertia-when-visible
      >
    </div>
    <div style="margin-top: 5000px">
      <inertia-when-visible data="foo" [buffer]="1000"
        ><ng-template inertiaWhenVisibleFallback><div>Loading second one...</div></ng-template
        ><ng-template inertiaWhenVisibleContent><div>Second one is visible!</div></ng-template></inertia-when-visible
      >
    </div>
    <div style="margin-top: 5000px">
      <inertia-when-visible data="foo" [always]="true"
        ><ng-template inertiaWhenVisibleFallback><div>Loading third one...</div></ng-template
        ><ng-template inertiaWhenVisibleContent><div>Third one is visible!</div></ng-template></inertia-when-visible
      >
    </div>
    <div style="margin-top: 5000px">
      <inertia-when-visible data="foo"
        ><ng-template inertiaWhenVisibleFallback><div>Loading fourth one...</div></ng-template></inertia-when-visible
      >
    </div>
    <div style="margin-top: 6000px">
      <inertia-when-visible [always]="true" [params]="countParams()"
        ><ng-template inertiaWhenVisibleFallback><div>Loading fifth one...</div></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><div>Count is now {{ count() }}</div></ng-template
        ></inertia-when-visible
      >
    </div>
  `,
})
class WhenVisiblePage {
  readonly count = signal(0)
  readonly countParams = computed<ReloadOptions>(() => ({
    data: { count: this.count() },
    onSuccess: () => this.count.update((value) => value + 1),
  }))
}

@Component({
  selector: 'test-when-visible-reload',
  imports: [visibleImports],
  template: `
    <h1>WhenVisible + Reload</h1>
    <button type="button" (click)="router.reload()">Reload Page</button>
    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <inertia-when-visible data="lazyData"
        ><ng-template inertiaWhenVisibleFallback><p>Loading lazy data...</p></ng-template
        ><ng-template inertiaWhenVisibleContent>{{ lazyData()?.text }}</ng-template></inertia-when-visible
      >
    </div>
  `,
})
class WhenVisibleReload {
  readonly lazyData = input<LazyData>()
  readonly router = router
}

@Component({
  selector: 'test-when-visible-array-reload',
  imports: [visibleImports],
  template: `
    <h1>WhenVisible + Array Props + Reload</h1>
    <button type="button" (click)="router.reload()">Reload Page</button>
    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <inertia-when-visible [data]="['firstData', 'secondData']"
        ><ng-template inertiaWhenVisibleFallback><p>Loading array data...</p></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><p>{{ firstData()?.text }}</p>
          <p>{{ secondData()?.text }}</p></ng-template
        ></inertia-when-visible
      >
    </div>
  `,
})
class WhenVisibleArrayReload {
  readonly firstData = input<LazyData>()
  readonly secondData = input<LazyData>()
  readonly router = router
}

@Component({
  selector: 'test-when-visible-back-button',
  imports: [visibleImports, Link],
  template: `
    <h1>WhenVisible + Back Button</h1>
    <a inertiaLink href="/links/method">Navigate Away</a>
    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <inertia-when-visible data="lazyData"
        ><ng-template inertiaWhenVisibleFallback><p>Loading lazy data...</p></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><p>{{ lazyData()?.text }}</p></ng-template
        ></inertia-when-visible
      >
    </div>
    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <inertia-when-visible data="lazyData" [always]="true"
        ><ng-template inertiaWhenVisibleFallback><p>Loading always data...</p></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><p>Always: {{ lazyData()?.text }}</p></ng-template
        ></inertia-when-visible
      >
    </div>
  `,
})
class WhenVisibleBackButton {
  readonly lazyData = input<LazyData>()
}

@Component({
  selector: 'test-when-visible-fetching',
  imports: [visibleImports],
  template: `
    <div style="margin-top: 5000px">
      <inertia-when-visible data="lazyData" [always]="true">
        <ng-template inertiaWhenVisibleFallback><div>Loading lazy data...</div></ng-template>
        <ng-template inertiaWhenVisibleContent let-fetching="fetching"
          ><div>Lazy data loaded!</div>
          @if (fetching) {
            <div>Fetching in background...</div>
          }
        </ng-template>
      </inertia-when-visible>
    </div>
  `,
})
class WhenVisibleFetching {}

@Component({
  selector: 'test-when-visible-merge-params',
  imports: [visibleImports],
  template: `
    <div id="data-only" style="margin-top: 3000px">
      <inertia-when-visible data="dataOnlyProp"
        ><ng-template inertiaWhenVisibleFallback><div>Loading data only...</div></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><div>Data only loaded: {{ dataOnlyProp()?.text }}</div></ng-template
        ></inertia-when-visible
      >
    </div>
    <div id="merged" style="margin-top: 5000px">
      <inertia-when-visible data="mergedProp" [params]="{ data: { extra: 'from-params' } }"
        ><ng-template inertiaWhenVisibleFallback><div>Loading merged...</div></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><div>Merged loaded: {{ mergedProp()?.text }}</div></ng-template
        ></inertia-when-visible
      >
    </div>
    <div id="merged-with-callback" style="margin-top: 5000px">
      <inertia-when-visible data="mergedWithCallbackProp" [params]="{ data: { page: '2' }, preserveUrl: true }"
        ><ng-template inertiaWhenVisibleFallback><div>Loading merged with callback...</div></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><div>Merged with callback loaded: {{ mergedWithCallbackProp()?.text }}</div></ng-template
        ></inertia-when-visible
      >
    </div>
  `,
})
class WhenVisibleMergeParams {
  readonly dataOnlyProp = input<LazyData>()
  readonly mergedProp = input<LazyData>()
  readonly mergedWithCallbackProp = input<LazyData>()
}

@Component({
  selector: 'test-when-visible-params-update',
  imports: [visibleImports],
  template: `
    <button type="button" (click)="paramValue.set('updated')">Update Param</button>
    <p>Current param: {{ paramValue() }}</p>
    <div style="margin-top: 3000px">
      <inertia-when-visible data="lazyData" [params]="params()" [always]="true"
        ><ng-template inertiaWhenVisibleFallback><p>Loading lazy data...</p></ng-template
        ><ng-template inertiaWhenVisibleContent
          ><p>Data loaded: {{ lazyData()?.text }}</p></ng-template
        ></inertia-when-visible
      >
    </div>
  `,
})
class WhenVisibleParamsUpdate {
  readonly lazyData = input<LazyData>()
  readonly paramValue = signal('initial')
  readonly params = computed<ReloadOptions>(() => ({ data: { paramValue: this.paramValue() } }))
}

@Component({
  selector: 'test-when-visible-preserve-errors',
  imports: [visibleImports],
  template: `
    @if (page().props.errors.name; as error) {
      <p id="page-error">{{ error }}</p>
    }
    @if (form.errors().name; as error) {
      <p id="form-error">{{ error }}</p>
    }
    <button type="button" (click)="form.post('/when-visible/preserve-errors')">Submit</button>
    <div style="height: 2000px"></div>
    <inertia-when-visible data="foo"
      ><ng-template inertiaWhenVisibleFallback><div id="loading">Loading foo...</div></ng-template
      ><ng-template inertiaWhenVisibleContent
        ><div id="foo">Foo: {{ foo() }}</div></ng-template
      ></inertia-when-visible
    >
  `,
})
class WhenVisiblePreserveErrors {
  readonly foo = input<string>()
  readonly page = usePage<{ errors?: { name?: string } }>()
  readonly form = useForm({ name: '' })
}

export const whenVisiblePages: Record<string, ResolvedComponent> = {
  WhenVisible: WhenVisiblePage,
  WhenVisibleReload,
  WhenVisibleArrayReload,
  WhenVisibleBackButton,
  WhenVisibleFetching,
  WhenVisibleMergeParams,
  WhenVisibleParamsUpdate,
  WhenVisiblePreserveErrors,
}
