<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  export let data: string | undefined
</script>

<Deferred data="data">
  <svelte:fragment slot="fallback">
    <div>Loading data...</div>
  </svelte:fragment>
  {data}
</Deferred>

<a href="/deferred-props/back-button/a" use:inertia>Go to Page A</a>
