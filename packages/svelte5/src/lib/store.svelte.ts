import type { Page } from '@inertiajs/core'
import type { InertiaComponentType } from './types'

interface Store {
  component: InertiaComponentType | null
  page: Page | null
  key?: number | null
}

const store: Store = $state({
  component: null,
  layout: [],
  page: null,
  key: null,
})

export default store
