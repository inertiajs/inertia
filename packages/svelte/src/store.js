import { writable } from 'svelte/store'

const store = writable({
  component: null,
  layout: [],
  page: {},
  key: null,
  frames: {}
})

export default store
