import { type Page, type PageProps, type SharedPageProps } from '@inertiajs/core'
import { derived, writable, type Readable } from 'svelte/store'

type SveltePage<TPageProps extends PageProps = PageProps> = Omit<Page<TPageProps & SharedPageProps>, 'props'> & {
  props: Page<TPageProps & SharedPageProps>['props'] & {
    [key: string]: any
  }
}

let pageAccessor: Readable<SveltePage> | null = null
const { set, subscribe } = writable<SveltePage>()

export const setPage = set

export default { subscribe }

export function usePage<TPageProps extends PageProps = PageProps>(): Readable<SveltePage<TPageProps>> {
  if (!pageAccessor) {
    pageAccessor = derived({ subscribe }, ($page) => $page)
  }

  return pageAccessor as Readable<SveltePage<TPageProps>>
}
