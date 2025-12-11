<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  export let foo: string
  export let bar: string
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/partial-reload/b">Go to Partial Reload B</Link>
<button on:click={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
