import { derived } from 'svelte/store'
import store from './store'

const page = derived(store, ($store) => $store.page)

export default page
