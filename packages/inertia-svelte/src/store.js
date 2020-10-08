import { writable } from 'svelte/store'

const store = writable({
  component: null,
  page: {},
  key: null,
})

export default store
