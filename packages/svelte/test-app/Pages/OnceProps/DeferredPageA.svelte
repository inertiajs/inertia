<script lang="ts">
  import { Deferred, Link } from '@inertiajs/svelte'

  interface Props {
    foo: { text: string } | undefined
    bar: string
  }

  let { foo, bar }: Props = $props()
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}

  <p id="foo">Foo: {foo?.text}</p>
</Deferred>

<p id="bar">Bar: {bar}</p>

<Link href="/once-props/deferred/b">Go to Deferred Page B</Link>
<Link href="/once-props/deferred/c" prefetch="mount">Go to Deferred Page C</Link>
