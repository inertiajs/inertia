<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  interface Props {
    foo: { text: string } | undefined
    bar: { text: string } | undefined
  }

  let { foo, bar }: Props = $props()
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

<a href="/deferred-props/page-1" use:inertia>Page 1</a>
<a href="/deferred-props/page-2" use:inertia>Page 2</a>
<a href="/deferred-props/page-3" use:inertia={{ prefetch: true }}>Page 3</a>
