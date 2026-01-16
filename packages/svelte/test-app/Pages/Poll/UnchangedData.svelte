<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let replaceStateCalls = $state(0)
  let pollsFinished = $state(0)

  onMount(() => {
    const original = window.history.replaceState.bind(window.history)
    window.history.replaceState = function (...args) {
      replaceStateCalls++
      return original(...args)
    }
  })

  usePoll(500, {
    only: ['custom_prop'],
    onFinish: () => pollsFinished++,
  })
</script>

<div>
  <p>replaceState calls: <span class="replaceStateCalls">{replaceStateCalls}</span></p>
  <p>polls finished: <span class="pollsFinished">{pollsFinished}</span></p>
</div>
