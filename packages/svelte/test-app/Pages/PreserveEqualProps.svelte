<script lang="ts">
  import { Link } from '@inertiajs/svelte'
  import { untrack } from 'svelte'

  type NestedA = { count: number }
  type NestedB = { date: number }

  interface Props {
    nestedA: NestedA
    nestedB: NestedB
  }

  let { nestedA, nestedB }: Props = $props()

  let effectACount = $state(1)
  let effectBCount = $state(1)

  // svelte-ignore state_referenced_locally
  let previousNestedAJson = $state(JSON.stringify(nestedA))

  $effect(() => {
    const currentJson = JSON.stringify(nestedA)

    if (currentJson !== previousNestedAJson) {
      effectACount++
      previousNestedAJson = currentJson
    }
  })

  // svelte-ignore state_referenced_locally
  let previousNestedBJson = $state(JSON.stringify(nestedB))

  $effect(() => {
    const currentJson = JSON.stringify(nestedB)

    if (currentJson !== previousNestedBJson) {
      untrack(() => {
        effectBCount++
        previousNestedBJson = currentJson
      })
    }
  })
</script>

<div>
  <h1>Preserve Equal Props</h1>
  <p id="count-a">Count A: {nestedA.count}</p>
  <p id="date-b">Date B: {nestedB.date}</p>
  <p id="effect-a">Effect A Count: {effectACount}</p>
  <p id="effect-b">Effect B Count: {effectBCount}</p>
  <Link method="post" href="/preserve-equal-props/back">Submit and redirect back</Link>
</div>
