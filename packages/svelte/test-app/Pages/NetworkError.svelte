<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let error = false

  onMount(() => {
    return router.on('exception', () => {
      error = true
      return false
    })
  })

  function makeRequest() {
    error = false
    router.get('/network-error')
  }
</script>

<div>
  <h1>Network Error</h1>
  {#if error}
    <div id="network-error">Network error occurred</div>
  {/if}
  <button id="make-request" on:click={makeRequest}>Make Request</button>
</div>
