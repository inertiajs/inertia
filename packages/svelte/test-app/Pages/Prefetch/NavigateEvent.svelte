<script module lang="ts">
  export { default as layout } from '@/Layouts/NavigateEventTest.svelte'
</script>

<script lang="ts">
  import { inertia } from '@inertiajs/svelte'
</script>

<a href="/prefetch/navigate-event/cached" use:inertia={{ prefetch: 'mount' }}>Prefetched Link</a>
<a href="/prefetch/navigate-event/fresh" use:inertia>Regular Link</a>
