import store from './store'
import { derived } from 'svelte/store'

const page = derived(store, ($store) => $store.page)

export default page
