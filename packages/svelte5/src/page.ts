import { type Page } from '@inertiajs/core'
import { writable } from 'svelte/store'

type SveltePage = Omit<Page, 'props'> & {
  props: Page['props'] & {
    [key: string]: any
  }
}

const { set, subscribe } = writable<SveltePage>()

export const setPage = set

export default { subscribe }
