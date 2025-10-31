<script lang="ts">
  import { config, Link } from '@inertiajs/svelte5'
  import { untrack } from 'svelte'

  interface Props {
    nestedA: { count: number };
    nestedB: { date: number };
  }

  let { nestedA, nestedB }: Props = $props();

  let effectACount = $state(0)
  let effectBCount = $state(0)

  let previousNestedA = $state(nestedA)
  let previousNestedB = $state(nestedB)

  $effect(() => {
    if (nestedA !== previousNestedA) {
      untrack(() => {
        effectACount++
        previousNestedA = nestedA
      })
    }
  });

  $effect(() => {
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
