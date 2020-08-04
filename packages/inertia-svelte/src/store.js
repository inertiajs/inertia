import { writable } from 'svelte/store'

const store = writable({
  component: null,
  key: null,
  props: {},
})

export default store
