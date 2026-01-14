<script lang="ts">
  import { config, Link } from '@inertiajs/svelte'

  export let nestedA: { count: number }
  export let nestedB: { date: number }

  let effectACount = 1
  let effectBCount = 1

  let previousNestedA: { count: number } = nestedA
  let previousNestedB: { date: number } = nestedB

  $: if (nestedA !== previousNestedA) {
    effectACount = effectACount + 1
    previousNestedA = nestedA
  }

  $: if (nestedB !== previousNestedB) {
    effectBCount = effectBCount + 1
    previousNestedB = nestedB
  }

  function enable() {
    config.set('future.preserveEqualProps', true)
  }
</script>

<div>
  <h1>Preserve Equal Props</h1>
  <p id="count-a">Count A: {nestedA.count}</p>
  <p id="date-b">Date B: {nestedB.date}</p>
  <p id="effect-a">Effect A Count: {effectACount}</p>
  <p id="effect-b">Effect B Count: {effectBCount}</p>
  <Link method="post" href="/preserve-equal-props/back">Submit and redirect back</Link>
  <button on:click={enable}>Enable</button>
</div>
