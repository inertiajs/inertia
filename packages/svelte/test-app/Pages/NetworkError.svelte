<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { status }: { status?: string } = $props()
</script>

<div>
  <h1>Network Error</h1>
  <div id="status">{status ?? 'idle'}</div>
  <button id="make-request" onclick={() => router.get('/network-error')}>Make Request</button>
</div>
