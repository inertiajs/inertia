<script lang="ts">
  import { Deferred, Link } from '@inertiajs/svelte'

  export let foo: { text: string } | undefined
  export let bar: string
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div>Loading foo...</div>
  </svelte:fragment>

  <p id="foo">Foo: {foo?.text}</p>
</Deferred>

<p id="bar">Bar: {bar}</p>

<Link href="/once-props/deferred/b">Go to Deferred Page B</Link>
<Link href="/once-props/deferred/c" prefetch="mount">Go to Deferred Page C</Link>
