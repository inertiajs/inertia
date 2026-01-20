<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const prefetchPage = () => {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitPage = () => {
    router.visit('/prefetch/swr/1')
  }

  const prefetchNonInertia = () => {
    router.prefetch('/non-inertia', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitNonInertia = () => {
    router.visit('/non-inertia')
  }
</script>

<div>
  <button on:click={prefetchPage}>Prefetch Page</button>
  <button on:click={visitPage}>Visit Page</button>
  <button on:click={prefetchNonInertia}>Prefetch Non-Inertia</button>
  <button on:click={visitNonInertia}>Visit Non-Inertia</button>
</div>
