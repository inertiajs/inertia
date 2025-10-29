<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  export let foo: { text: string } | undefined
  export let bar: { text: string } | undefined
</script>

<Deferred data="foo" let:loading>
  {#if loading}
    <div>Loading foo (callback)...</div>
  {:else}
    {foo?.text}
  {/if}
</Deferred>

<Deferred data="bar" let:loading>
  {#if loading}
    <div>Loading bar (callback)...</div>
  {:else}
    {bar?.text}
  {/if}
</Deferred>

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
