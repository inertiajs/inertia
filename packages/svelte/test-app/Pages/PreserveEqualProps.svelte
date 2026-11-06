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

  let effectACount = $state(0)
  let effectBCount = $state(0)

  $effect(() => {
    void nestedA
    untrack(() => effectACount++)
  })

  $effect(() => {
    void nestedB
    untrack(() => effectBCount++)
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
