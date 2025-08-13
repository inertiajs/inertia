<script>
import { router } from '@inertiajs/svelte'

const prefetchPage = () => {
  router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
}

const visitPage = () => {
  router.visit('/prefetch/swr/1')
}
</script>

<div>
  <button on:click={prefetchPage}>Prefetch Page</button>
  <button on:click={visitPage}>Visit Page</button>
</div>