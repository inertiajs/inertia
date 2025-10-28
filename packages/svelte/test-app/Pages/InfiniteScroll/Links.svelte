<script lang="ts">
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <a href="/infinite-scroll-with-link" use:inertia>Go to InfiniteScrollWithLink</a>
  <a href="/infinite-scroll-with-link" use:inertia={{ prefetch: true }}>Go to InfiniteScrollWithLink (Prefetch)</a>
</div>
