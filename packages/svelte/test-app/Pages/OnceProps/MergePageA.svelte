<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  export let items: string[]
  export let bar: string
</script>

<p id="items">Items count: {items.length}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/merge/b">Go to Merge Page B</Link>
<button on:click={() => router.reload({ only: ['items'] })}>Load more items</button>
