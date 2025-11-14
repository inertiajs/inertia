import { type Page, type PageProps, type SharedPageProps } from '@inertiajs/core'
import { derived, writable, type Readable } from 'svelte/store'

type SveltePage<TPageProps extends PageProps = PageProps> = Omit<Page<TPageProps & SharedPageProps>, 'props'> & {
  props: Page<TPageProps & SharedPageProps>['props'] & {
    [key: string]: any
  }
}

const { set, subscribe } = writable<SveltePage>()

export const setPage = set

export default { subscribe }

export function usePage<TPageProps extends PageProps = PageProps>(): Readable<SveltePage<TPageProps>> {
  return derived({ subscribe }, ($page) => $page as SveltePage<TPageProps>)
}
