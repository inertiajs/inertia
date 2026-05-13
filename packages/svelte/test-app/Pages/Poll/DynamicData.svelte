<script lang="ts">
  import { router, usePoll } from '@inertiajs/svelte'

  let { counter, last_received } = $props()

  usePoll(300, () => ({
    data: { counter_seen: counter },
    only: ['last_received'],
  }))
</script>

<div id="counter">counter: {counter}</div>
<div id="last_received">received: {last_received ?? 'null'}</div>
<button onclick={() => router.reload({ only: ['counter'], data: { bump: counter + 1 } })}>Increment</button>
