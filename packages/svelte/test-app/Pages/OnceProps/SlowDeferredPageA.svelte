<script lang="ts">
  import { Deferred, Link } from '@inertiajs/svelte'

  interface Props {
    foo: string | undefined
    bar: string
  }

  let { foo, bar }: Props = $props()
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div id="foo-loading">Loading foo...</div>
  {/snippet}

  <p id="foo">Foo: {foo}</p>
</Deferred>

<p id="bar">Bar: {bar}</p>

<Link href="/once-props/slow-deferred/b">Go to Page B</Link>
