<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  onMount(() => {
    router.on('navigate', (event) => {
      console.log(String(event.detail.cached))
    })
  })
</script>

<a href="/prefetch/navigate-event/cached" use:inertia={{ prefetch: 'mount' }}>Prefetched Link</a>
<a href="/prefetch/navigate-event/fresh" use:inertia>Regular Link</a>
