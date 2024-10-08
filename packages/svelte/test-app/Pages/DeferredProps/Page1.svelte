<script>
  import { Deferred, inertia } from '@inertiajs/svelte'

  export let foo
  export let bar
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div>Loading foo...</div>
  </svelte:fragment>
  {foo}
</Deferred>

<Deferred data="bar">
  <svelte:fragment slot="fallback">
    <div>Loading bar...</div>
  </svelte:fragment>
  {bar}
</Deferred>

<a href="/deferred-props/page-2" use:inertia>Page 2</a>
