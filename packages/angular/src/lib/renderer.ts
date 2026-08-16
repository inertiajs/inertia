import {
  AfterViewInit,
  Component,
  ComponentRef,
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  Type,
  ViewContainerRef,
  createEnvironmentInjector,
  inject,
  reflectComponentType,
  viewChild,
} from '@angular/core'
import { isPropsObject, isPropsObjectOrCallback, normalizeLayouts, type Page } from '@inertiajs/core'
import { INERTIA_LAYOUT_CHILD } from './tokens'
import type { AngularRenderFunction, AngularRenderNode, ResolvedComponent } from './types'

type RenderedLayout = {
  component: Type<unknown>
  name?: string
  props: Record<string, unknown>
}

@Component({
  selector: 'inertia-layout-outlet',
  template: '<ng-container #outlet />',
})
export class LayoutOutlet implements AfterViewInit {
  readonly outlet = viewChild.required('outlet', { read: ViewContainerRef })
  readonly #attach = inject(INERTIA_LAYOUT_CHILD)

  ngAfterViewInit(): void {
    this.#attach(this.outlet())
  }
}

function isComponent(value: unknown): value is Type<unknown> {
  return typeof value === 'function' && reflectComponentType(value as Type<unknown>) !== null
}

function isRenderFunction(value: unknown): value is AngularRenderFunction {
  return typeof value === 'function' && value.length >= 2 && !isComponent(value)
}

export function h(component: Type<unknown>, children: AngularRenderNode | AngularRenderNode[] = []): AngularRenderNode {
  return {
    component,
    children: Array.isArray(children) ? children : [children],
  }
}

@Injectable()
export class InertiaRenderer {
  readonly #environmentInjector = inject(EnvironmentInjector)
  readonly #destroyRef = inject(DestroyRef)
  readonly #boundInputs = new WeakMap<ComponentRef<unknown>, Set<string>>()
  #root?: ViewContainerRef
  #pageOutlet: ViewContainerRef | undefined
  #page: ComponentRef<unknown> | undefined
  #pageKey: number | null | undefined
  #layouts: Array<ComponentRef<unknown>> = []
  #layoutTypes: Array<Type<unknown>> = []
  #layoutInjectors: EnvironmentInjector[] = []
  readonly #pendingDestroy = new Map<ReturnType<typeof setTimeout>, () => void>()

  constructor() {
    this.#destroyRef.onDestroy(() => {
      this.#flushPendingDestroy()
      this.#destroyLayoutInjectors()
    })
  }

  render(
    root: ViewContainerRef,
    component: ResolvedComponent,
    page: Page,
    key: number | null,
    dynamicProps: { shared: Record<string, unknown>; named: Record<string, Record<string, unknown>> },
    defaultLayout?: (name: string, page: Page) => unknown,
  ): void {
    this.#root = root
    const layouts = this.#resolveLayouts(component, page, defaultLayout)
    const layoutTypes = layouts.map((layout) => layout.component)
    const canReuseLayouts =
      this.#pageOutlet !== undefined &&
      layoutTypes.length === this.#layoutTypes.length &&
      layoutTypes.every((type, index) => this.#layoutTypes[index] === type)

    if (!canReuseLayouts) {
      this.#buildLayoutChain(layouts)
    }

    const preservePage = this.#page?.componentType === component && this.#pageKey === key

    if (!preservePage) {
      if (this.#page) {
        this.#detachAndDestroyLater(this.#pageOutlet!, this.#page)
      }
      this.#page = this.#pageOutlet!.createComponent(component, {
        environmentInjector: this.#environmentInjector,
      })
      this.#pageKey = key
    }

    this.#setInputs(this.#page!, page.props)

    this.#layouts.forEach((layoutRef, index) => {
      const layout = layouts[index]
      if (!layout) {
        return
      }

      this.#setInputs(layoutRef, {
        ...page.props,
        ...layout.props,
        ...dynamicProps.shared,
        ...(layout.name ? (dynamicProps.named[layout.name] ?? {}) : {}),
      })
    })

    this.#layouts.forEach((layout) => layout.changeDetectorRef.detectChanges())
    this.#page!.changeDetectorRef.detectChanges()
  }

  #buildLayoutChain(layouts: RenderedLayout[]): void {
    const previousRoot = this.#layouts[0] ?? this.#page
    const previousInjectors = this.#layoutInjectors.splice(0)
    if (previousRoot) {
      this.#detachAndDestroyLater(this.#root!, previousRoot, previousInjectors)
    } else {
      this.#root!.clear()
      previousInjectors.forEach((injector) => injector.destroy())
    }
    this.#layouts = []
    this.#layoutTypes = layouts.map((layout) => layout.component)
    this.#page = undefined
    this.#pageKey = undefined

    if (layouts.length === 0) {
      this.#pageOutlet = this.#root!
      return
    }

    try {
      this.#createLayout(layouts, 0, this.#root!)
    } catch (error) {
      // A layout that never renders <inertia-layout-outlet /> leaves a half-built chain
      // behind. Roll it back so the next render cannot reuse a dead outlet and instead
      // rebuilds and reports the same error.
      this.#discardLayoutChain()
      throw error
    }
  }

  #discardLayoutChain(): void {
    this.#layouts
      .splice(0)
      .reverse()
      .forEach((layoutRef) => layoutRef?.destroy())
    this.#destroyLayoutInjectors()
    this.#root?.clear()
    this.#layoutTypes = []
    this.#pageOutlet = undefined
    this.#page = undefined
    this.#pageKey = undefined
  }

  #createLayout(layouts: RenderedLayout[], index: number, outlet: ViewContainerRef): void {
    const layout = layouts[index]
    if (!layout) {
      this.#pageOutlet = outlet
      return
    }

    let attached = false
    const injector = createEnvironmentInjector(
      [
        {
          provide: INERTIA_LAYOUT_CHILD,
          useValue: (childOutlet: ViewContainerRef) => {
            attached = true
            this.#createLayout(layouts, index + 1, childOutlet)
          },
        },
      ],
      this.#environmentInjector,
    )
    this.#layoutInjectors.push(injector)
    const layoutRef = outlet.createComponent(layout.component, { environmentInjector: injector })
    this.#layouts[index] = layoutRef
    layoutRef.changeDetectorRef.detectChanges()

    if (!attached) {
      throw new Error(
        `${layout.component.name || 'An Inertia layout'} must render <inertia-layout-outlet /> and import LayoutOutlet.`,
      )
    }
  }

  #destroyLayoutInjectors(): void {
    this.#layoutInjectors.splice(0).forEach((injector) => injector.destroy())
  }

  #detachAndDestroyLater(
    outlet: ViewContainerRef,
    component: ComponentRef<unknown>,
    injectors: EnvironmentInjector[] = [],
  ): void {
    const index = outlet.indexOf(component.hostView)
    if (index >= 0) {
      outlet.detach(index)
    }

    const destroy = () => {
      component.destroy()
      injectors.forEach((injector) => injector.destroy())
    }

    // Keep destruction out of the render pass that detached the view. Angular can still be
    // unwinding the old view's lifecycle or event stack, so destroy it on the next task.
    const timer = setTimeout(() => {
      this.#pendingDestroy.delete(timer)
      destroy()
    })
    this.#pendingDestroy.set(timer, destroy)
  }

  // `detach()` removes the view without destroying it, so a pending timer still owns real
  // cleanup. Cancelling the timers alone would leak every detached view, so run their work
  // synchronously instead.
  #flushPendingDestroy(): void {
    const pending = Array.from(this.#pendingDestroy)
    this.#pendingDestroy.clear()

    pending.forEach(([timer, destroy]) => {
      clearTimeout(timer)
      destroy()
    })
  }

  #resolveLayouts(
    component: ResolvedComponent,
    page: Page,
    defaultLayout?: (name: string, page: Page) => unknown,
  ): RenderedLayout[] {
    const pageNode = h(component)
    const layoutValue = component.layout

    if (isRenderFunction(layoutValue)) {
      const rendered = layoutValue(h, pageNode)
      return this.#flattenRenderTree(rendered, component)
    }

    let effectiveLayout: unknown
    let callbackProps: Record<string, unknown> | null = null

    if (typeof layoutValue === 'function' && !isComponent(layoutValue)) {
      const result = (layoutValue as (props: Page['props']) => unknown)(page.props)
      if (isPropsObjectOrCallback(result, isComponent)) {
        effectiveLayout = defaultLayout?.(page.component, page)
        callbackProps = result as Record<string, unknown>
      } else {
        effectiveLayout = result
      }
    } else if (isPropsObject(layoutValue, isComponent)) {
      effectiveLayout = defaultLayout?.(page.component, page)
      callbackProps = layoutValue as Record<string, unknown>
    } else {
      effectiveLayout = layoutValue ?? defaultLayout?.(page.component, page)
    }

    return normalizeLayouts(effectiveLayout, isComponent).map((layout) => ({
      component: layout.component,
      ...(layout.name ? { name: layout.name } : {}),
      props: { ...layout.props, ...callbackProps },
    }))
  }

  #flattenRenderTree(node: AngularRenderNode, pageComponent: Type<unknown>): RenderedLayout[] {
    const layouts: RenderedLayout[] = []
    let current = node

    while (current.component !== pageComponent) {
      layouts.push({ component: current.component, props: {} })
      const child = current.children[0]
      if (!child) {
        throw new Error('An Inertia layout render function must include the page node.')
      }
      current = child
    }

    return layouts
  }

  #setInputs(ref: ComponentRef<unknown>, props: Record<string, unknown>): void {
    const mirror = reflectComponentType(ref.componentType)
    if (!mirror) {
      return
    }

    const previous = this.#boundInputs.get(ref) ?? new Set<string>()
    const next = new Set<string>()

    for (const input of mirror.inputs) {
      const publicName = input.templateName
      const propertyName = input.propName
      const hasPublicValue = Object.prototype.hasOwnProperty.call(props, publicName)
      const hasPropertyValue = Object.prototype.hasOwnProperty.call(props, propertyName)

      if (hasPublicValue || hasPropertyValue) {
        ref.setInput(publicName, props[hasPublicValue ? publicName : propertyName])
        next.add(publicName)
      } else if (previous.has(publicName)) {
        ref.setInput(publicName, undefined)
      }
    }

    this.#boundInputs.set(ref, next)
  }
}
