<script lang="ts">
  import { config, Link } from '@inertiajs/svelte5'
  import { untrack } from 'svelte'

  interface Props {
    nestedA: { count: number };
    nestedB: { date: number };
  }

  let propies = $props();
  let { nestedA, nestedB }: Props = $derived($state.snapshot(propies));

  let effectACount = $state(0)
  let effectBCount = $state(0)

  // Store the actual REFERENCES, not snapshots
  let previousNestedA = nestedA
  let previousNestedB = nestedB

  $effect(() => {
    ;[propies]
    untrack(() => {
      console.log(propies, JSON.stringify(propies))
    })
  })

  $effect(() => {
    // Check if the REFERENCE changed
    if (nestedA !== previousNestedA) {
      untrack(() => {
        effectACount++
        previousNestedA = nestedA
      })
    }
  });

  $effect(() => {
    // Check if the REFERENCE changed
    if (nestedB !== previousNestedB) {
      untrack(() => {
        effectBCount++
        previousNestedB = nestedB
      })
    }
  })

  function enable() {
    config.set('future.preserveEqualProps', true)
    setTimeout(() => {
      console.log(config.get('future.preserveEqualProps'))
    }, 300)
  }
</script>

<div>
  <h1>Preserve Equal Props</h1>
  <p id="count-a">Count A: {nestedA.count}</p>
  <p id="date-b">Date B: {nestedB.date}</p>
  <p id="effect-a">Effect A Count: {effectACount}</p>
  <p id="effect-b">Effect B Count: {effectBCount}</p>
  <Link method="post" href="/preserve-equal-props/back">Submit and redirect back</Link>
  <button onclick={enable}>Enable</button>
</div>
