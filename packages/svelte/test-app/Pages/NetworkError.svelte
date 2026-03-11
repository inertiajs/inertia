<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { status }: { status?: string } = $props()
  let error = $state(false)

  function makeRequest() {
    error = false
    router.get('/network-error', {}, { onNetworkError: () => (error = true) })
  }
</script>

<div>
  <h1>Network Error</h1>
  <div id="status">{status ?? 'idle'}</div>
  {#if error}
    <div id="network-error">Network error occurred</div>
  {/if}
  <button id="make-request" onclick={makeRequest}>Make Request</button>
</div>
