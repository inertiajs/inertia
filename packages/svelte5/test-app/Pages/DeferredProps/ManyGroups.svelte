<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte5'

  const { foo, bar, baz, qux, quux }: {
    foo?: { text: string };
    bar?: { text: string };
    baz?: { text: string };
    qux?: { text: string };
    quux?: { text: string };
  } = $props()
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

<Deferred data="baz">
  {baz?.text}
  {#snippet fallback()}
    <div>Loading baz...</div>
  {/snippet}
</Deferred>

<Deferred data="qux">
  {qux?.text}
  {#snippet fallback()}
    <div>Loading qux...</div>
  {/snippet}
</Deferred>

<Deferred data="quux">
  {quux?.text}
  {#snippet fallback()}
    <div>Loading quux...</div>
  {/snippet}
</Deferred>

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
<a href="/deferred-props/many-groups" use:inertia>Many groups</a>
