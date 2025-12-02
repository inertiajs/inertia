<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  export let navigatedTo: boolean
</script>

<div>
  <h1 data-testid="ssr-title">SSR Page 2</h1>
  <p data-testid="navigated-status">Navigated: {navigatedTo}</p>

  <a href="/ssr/page1" use:inertia data-testid="back-link">Go back</a>
</div>
