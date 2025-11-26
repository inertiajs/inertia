<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  interface Props {
    foo: { text: string } | undefined
    bar: { text: string } | undefined
    baz: { text: string } | undefined
    qux: { text: string } | undefined
    quux: { text: string } | undefined
  }

  let { foo, bar, baz, qux, quux }: Props = $props()
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}
  {foo?.text}
</Deferred>

<Deferred data="bar">
  {#snippet fallback()}
    <div>Loading bar...</div>
  {/snippet}
  {bar?.text}
</Deferred>

<Deferred data="baz">
  {#snippet fallback()}
    <div>Loading baz...</div>
  {/snippet}
  {baz?.text}
</Deferred>

<Deferred data="qux">
  {#snippet fallback()}
    <div>Loading qux...</div>
  {/snippet}
  {qux?.text}
</Deferred>

<Deferred data="quux">
  {#snippet fallback()}
    <div>Loading quux...</div>
  {/snippet}
  {quux?.text}
</Deferred>

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
<a href="/deferred-props/many-groups" use:inertia>Many groups</a>
