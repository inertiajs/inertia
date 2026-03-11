<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let error = $state(false)

  function makeRequest() {
    error = false
    router.get('/network-error', {}, { onNetworkError: () => (error = true) })
  }
</script>

<div>
  <h1>Network Error</h1>
  {#if error}
    <div id="network-error">Network error occurred</div>
  {/if}
  <button id="make-request" onclick={makeRequest}>Make Request</button>
</div>
