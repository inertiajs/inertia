<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte5'

  const { foo, bar }: { foo?: { text: string }; bar?: { text: string } } = $props()
</script>

<Deferred data="foo">
  {foo?.text}
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}
</Deferred>

<Deferred data="bar">
  {bar?.text}
  {#snippet fallback()}
    <div>Loading bar...</div>
  {/snippet}
</Deferred>

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
