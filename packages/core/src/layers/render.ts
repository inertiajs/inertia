import { router } from '..'
import { layerPageOf, layersOf } from '../layers'
import { LayerShellProps, LayerState, LoadingOption, Page, ResolvedLayer } from '../types'

const layerShellProps = (layer: LayerState, index: number, stack: number): LayerShellProps => ({
  open: !layer.closing,
  index,
  isTop: index === stack - 1,
  type: layer.local ? 'local' : 'routed',
  close: () => router.close(layer.id),
  done: () => router.closed(layer.id),
})

const layerIdAttribute = 'data-layer-id'

// The layer an element sits in, read off the wrapper the renderer put the attributes on.
export const layerIdOf = (element: Element): string | undefined =>
  element.closest(`[${layerIdAttribute}]`)?.getAttribute(layerIdAttribute) ?? undefined

export const resolveLayers = <ComponentType>(
  page: Page,
  resolve: (name: string, page: Page) => ComponentType | Promise<ComponentType>,
): Promise<ResolvedLayer<ComponentType>[]> => {
  const stack = layersOf(page)

  return Promise.all(
    stack.map(async (layer, index) => {
      const layerPage = layerPageOf(page, layer)

      return {
        id: layer.id,
        renderKey: layer.renderKey,
        component: await resolve(layer.component, layerPage),
        page: layerPage,
        layoutPage: { ...layerPage, url: layer.url ?? '' },
        attributes: { [layerIdAttribute]: layer.id },
        transitionName: `inertia-layer-${layer.id}`,
        shell: layerShellProps(layer, index, stack.length),
      }
    }),
  )
}

export const normalizeLoading = <ComponentType>(
  loading: LoadingOption | undefined,
  {
    blank,
    rendered = () => false,
    normalize = (value) => ((value as { default?: ComponentType })?.default || value) as ComponentType,
  }: {
    blank: ComponentType
    rendered?: (value: unknown) => boolean
    normalize?: (value: unknown) => ComponentType
  },
): ((url: string, page: Page) => Promise<ComponentType>) => {
  if (loading === undefined) {
    return async () => blank
  }

  return async (url, page) => {
    if (typeof loading !== 'function') {
      return normalize(loading)
    }

    let resolved: unknown

    try {
      resolved = await (loading as (url: string, page: Page) => unknown)(url, page)
    } catch {
      // A component, not a resolver: it threw on the arguments.
      return normalize(loading)
    }

    if (resolved == null) {
      return blank
    }

    return rendered(resolved) ? normalize(loading) : normalize(resolved)
  }
}
