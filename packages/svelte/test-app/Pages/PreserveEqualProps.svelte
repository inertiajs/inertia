<script lang="ts">
  import { config, Link } from '@inertiajs/svelte'
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

  // svelte-ignore state_referenced_locally
  let previousNestedA = $state(nestedA)
  // svelte-ignore state_referenced_locally
  let previousNestedB = $state(nestedB)

  $effect(() => {
    const preserve = untrack(() => config.get('future.preserveEqualProps'))

    // Even when `preserveEqualProps` is enabled, Svelte will wrap incoming props
    // in a new reactive Proxy on each update. That means the reference to `nestedA`
    // changes every time, regardless of whether the underlying object from Inertia
    // was preserved or not. To avoid false positives, we compare by value when
    // `preserveEqualProps` is enabled, and by reference otherwise.
    const isDifferent = preserve
      ? (a: NestedA, b: NestedA) => JSON.stringify(a) !== JSON.stringify(b)
      : (a: NestedA, b: NestedA) => a !== b

    if (isDifferent(nestedA, previousNestedA)) {
      effectACount++
      previousNestedA = preserve ? structuredClone(nestedA) : nestedA
    }
  })

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
