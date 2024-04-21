import type { Page } from '@inertiajs/core'
import type { InertiaComponentType } from './types'
import { writable } from 'svelte/store'

interface Store {
  component: InertiaComponentType | null
  page: Page | null
  key?: number | null
}

const store = writable<Store>({
  component: null,
  page: null,
  key: null,
})

export default store
