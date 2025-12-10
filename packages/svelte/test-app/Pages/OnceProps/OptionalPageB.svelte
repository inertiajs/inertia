<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  export let foo: string | undefined
  export let bar: string
</script>

<p id="foo">Foo: {foo ?? 'not loaded'}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/optional/a">Go to Optional Page A</Link>
<button on:click={() => router.reload({ only: ['foo'] })}>Load foo</button>
