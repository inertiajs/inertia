<script lang="ts">
  import { router, socketId } from '@inertiajs/svelte'
  import { onDestroy } from 'svelte'

  let { socketIdHeader }: { socketIdHeader: string | null } = $props()

  let resolved = $state<string | null>(null)

  const registerResolver = () => {
    socketId.resolveUsing(() => 'socket-abc-123')
    resolved = socketId.resolve()
  }

  const registerEmptyResolver = () => {
    socketId.resolveUsing(() => null)
    resolved = socketId.resolve()
  }

  const clearResolver = () => {
    socketId.resolveUsing(null)
    resolved = socketId.resolve()
  }

  const reload = () => {
    router.reload({ only: ['socketIdHeader'] })
  }

  const visitDump = () => {
    router.get('/dump/get')
  }

  const visitDumpWithOwnSocketId = () => {
    router.get('/dump/get', {}, { headers: { 'X-Socket-ID': 'socket-set-by-app' } })
  }

  onDestroy(() => socketId.resolveUsing(null))
</script>

<div>
  <h1>Socket Id</h1>

  <p>
    Resolved socket id: <span id="resolved">{resolved ?? 'none'}</span>
  </p>
  <p>
    Header received by the server: <span id="header">{socketIdHeader ?? 'none'}</span>
  </p>

  <button onclick={registerResolver}>Register Resolver</button>
  <button onclick={registerEmptyResolver}>Register Empty Resolver</button>
  <button onclick={clearResolver}>Clear Resolver</button>
  <button onclick={reload}>Reload</button>
  <button onclick={visitDump}>Visit Dump Page</button>
  <button onclick={visitDumpWithOwnSocketId}>Send Own Socket Id</button>
</div>
