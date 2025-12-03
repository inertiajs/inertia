<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  export let foo: string
  export let bar: string
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/page-b">Go to Page B</Link>
<Link href="/once-props/page-c">Go to Page C</Link>
<Link href="/once-props/page-d" prefetch="mount">Go to Page D</Link>
<button on:click={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
