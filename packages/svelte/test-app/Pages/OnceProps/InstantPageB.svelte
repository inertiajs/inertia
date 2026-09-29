<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  interface Props {
    foo: string | undefined
    bar: string | undefined
  }

  let { foo, bar }: Props = $props()
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}

  <p id="foo">Foo: {foo}</p>
</Deferred>

<p id="bar">Bar: {bar}</p>
