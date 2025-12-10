<script lang="ts">
  import { Deferred, Link } from '@inertiajs/svelte'

  export let foo: string | undefined
  export let bar: string
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div id="foo-loading">Loading foo...</div>
  </svelte:fragment>

  <p id="foo">Foo: {foo}</p>
</Deferred>

<p id="bar">Bar: {bar}</p>

<Link href="/once-props/slow-deferred/a">Go to Page A</Link>
