<script lang="ts">
  import { router } from '@inertiajs/svelte5'

  const prefetchPage = () => {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitPage = () => {
    router.visit('/prefetch/swr/1')
  }
</script>

<div>
  <button onclick={prefetchPage}>Prefetch Page</button>
  <button onclick={visitPage}>Visit Page</button>
</div>
