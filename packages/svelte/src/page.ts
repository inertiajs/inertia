import { derived } from 'svelte/store'
import store from './store'

let initialized = false
const page = derived(store, ($store, set) => {
  // This ensures that page props and the $page store are updated
  // in the same render, such as when using deferred props.
  if (initialized && typeof window !== 'undefined') {
    window.queueMicrotask(() => set($store.page))
    return
  }
  set($store.page)
  initialized = true
})

export default page
