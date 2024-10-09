import type { Page } from '@inertiajs/core'
import { writable } from 'svelte/store'
import type { ResolvedComponent } from './types'

export interface InertiaStore {
  component: ResolvedComponent
  page: Page
  key: number | null
}

const store = writable<InertiaStore>({
  component: null as unknown as ResolvedComponent,
  page: null as unknown as Page,
  key: null,
})

export default store
