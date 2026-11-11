import { createLayerApi, type LayerApi, type Page, type PageProps, type SharedPageProps } from '@inertiajs/core'
import { getContext } from 'svelte'

type SveltePage<TPageProps extends PageProps = PageProps> = Omit<Page<TPageProps & SharedPageProps>, 'props'> & {
  props: Page<TPageProps & SharedPageProps>['props'] & {
    [key: string]: any
  }
}

const page = $state<SveltePage>({
  component: '',
  props: {},
  url: '',
  version: null,
} as SveltePage)

export const layerPageKey = Symbol('inertiaLayerPage')
export const layerIdKey = Symbol('inertiaLayerId')

export function layerId(): string | undefined {
  try {
    return getContext<string>(layerIdKey)
  } catch {
    return undefined
  }
}

export function useLayer(): LayerApi {
  return createLayerApi(layerId())
}

export function setPage(newPage: SveltePage) {
  for (const key of Object.keys(page)) {
    if (!(key in newPage)) {
      delete (page as Record<string, unknown>)[key]
    }
  }

  Object.assign(page, newPage)
}

export function usePage<TPageProps extends PageProps = PageProps>(): SveltePage<TPageProps> {
  try {
    const layerPage = getContext<Page>(layerPageKey)

    if (layerPage) {
      return layerPage as SveltePage<TPageProps>
    }
  } catch {}

  return page as SveltePage<TPageProps>
}

export default page
