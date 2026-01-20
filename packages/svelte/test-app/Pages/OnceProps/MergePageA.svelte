<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  interface Props {
    items: string[]
    bar: string
  }

  let { items, bar }: Props = $props()
</script>

<p id="items">Items count: {items.length}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/merge/b">Go to Merge Page B</Link>
<button onclick={() => router.reload({ only: ['items'] })}>Load more items</button>
