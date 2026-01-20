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
  <button onclick={prefetchPage}>Prefetch Page</button>
  <button onclick={visitPage}>Visit Page</button>
  <button onclick={prefetchNonInertia}>Prefetch Non-Inertia</button>
  <button onclick={visitNonInertia}>Visit Non-Inertia</button>
</div>
