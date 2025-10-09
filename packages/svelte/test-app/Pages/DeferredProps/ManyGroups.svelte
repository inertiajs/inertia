<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  export let foo: { text: string } | undefined
  export let bar: { text: string } | undefined
  export let baz: { text: string } | undefined
  export let qux: { text: string } | undefined
  export let quux: { text: string } | undefined
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

<Deferred data="baz">
  <svelte:fragment slot="fallback">
    <div>Loading baz...</div>
  </svelte:fragment>
  {baz?.text}
</Deferred>

<Deferred data="qux">
  <svelte:fragment slot="fallback">
    <div>Loading qux...</div>
  </svelte:fragment>
  {qux?.text}
</Deferred>

<Deferred data="quux">
  <svelte:fragment slot="fallback">
    <div>Loading quux...</div>
  </svelte:fragment>
  {quux?.text}
</Deferred>

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
<a href="/deferred-props/many-groups" use:inertia>Many groups</a>
