import { derived } from 'svelte/store'
import store from './store'

const page = derived(store, $store => $store.props)

export default page
