<script lang="ts">
  import { Link, router, usePoll } from '@inertiajs/svelte'

  export let counter: number
  export let last_received: number | null = null

  usePoll(300, () => ({
    data: { counter_seen: counter },
    only: ['last_received'],
  }))
</script>

<div id="counter">counter: {counter}</div>
<div id="last_received">received: {last_received ?? 'null'}</div>
<button on:click={() => router.reload({ only: ['counter'], data: { bump: counter + 1 } })}>Increment</button>
<Link href="/">Home</Link>
