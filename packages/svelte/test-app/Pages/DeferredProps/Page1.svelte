<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  export let foo: { text: string } | undefined
  export let bar: { text: string } | undefined
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div>Loading foo...</div>
  </svelte:fragment>
  {foo?.text}
</Deferred>

<Deferred data="bar">
  <svelte:fragment slot="fallback">
    <div>Loading bar...</div>
  </svelte:fragment>
  {bar?.text}
</Deferred>

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
<a href="/deferred-props/page-3" use:inertia={{ prefetch: true }}>Page 3</a>
