import store from './store.svelte'

const page = {
  get current() {
    return store.page
  },
}

export default page
