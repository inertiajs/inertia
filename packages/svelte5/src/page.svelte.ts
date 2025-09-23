import { type Page } from '@inertiajs/core'
import { writable } from 'svelte/store'

type SveltePage = Omit<Page, 'props'> & {
  props: Page['props'] & {
    [key: string]: any
  }
}

// Create both runes-based state AND store-based state for backward compatibility
export const pageState = $state<SveltePage>({
  component: '',
  props: {},
  url: '',
  version: ''
} as SveltePage)

// Create a Svelte store for backward compatibility with $page syntax
const { set: setPageStore, subscribe } = writable<SveltePage>(pageState)

export const setPage = (newPage: SveltePage) => {
  // Update the runes-based state (only mutate properties)
  pageState.component = newPage.component
  pageState.props = newPage.props
  pageState.url = newPage.url
  pageState.version = newPage.version
  
  // Copy any additional properties
  Object.keys(newPage).forEach(key => {
    if (key !== 'component' && key !== 'props' && key !== 'url' && key !== 'version') {
      ;(pageState as any)[key] = (newPage as any)[key]
    }
  })
  
  // Also update the store for backward compatibility
  setPageStore(pageState)
}

// Export the runes-based state as pageState for new components
// Export a store-compatible object as default for backward compatibility
export const page = { subscribe }
