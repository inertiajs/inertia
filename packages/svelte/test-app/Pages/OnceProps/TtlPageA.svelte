<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  export let foo: string
  export let bar: string
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/ttl/b">Go to TTL Page B</Link>
<Link href="/once-props/ttl/c" prefetch="mount">Go to TTL Page C</Link>
<button on:click={() => router.reload({ only: ['foo'] })}>Reload foo</button>
