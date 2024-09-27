import type { Page } from '@inertiajs/core'
import { writable } from 'svelte/store'
import type { ResolvedComponent } from './types'

export interface InertiaStore {
  component: ResolvedComponent | null
  page: Page | null
  key: number | null
}

const store = writable<InertiaStore>({
  component: null,
  page: null,
  key: null,
})

export default store
