import { type Page } from '@inertiajs/core'
import { writable } from 'svelte/store'

const { set, subscribe } = writable<Page>()

export const setPage = set

export default { subscribe }
