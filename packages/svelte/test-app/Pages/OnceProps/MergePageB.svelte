<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  export let items: string[]
  export let bar: string
</script>

<p id="items">Items count: {items.length}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/merge/a">Go to Merge Page A</Link>
<button on:click={() => router.reload({ only: ['items'] })}>Load more items</button>
