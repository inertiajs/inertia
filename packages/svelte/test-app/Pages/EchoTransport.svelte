<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let {
    order,
    stats,
    room,
    secret,
    news,
    socketIdHeader,
  }: {
    order: string
    stats: string
    room: string
    secret: string
    news: string
    socketIdHeader: string | null
  } = $props()

  let log = $state<string[]>([])

  const showLog = () => {
    log = window.__inertiaEcho?.log() ?? []
  }

  onMount(showLog)
</script>

<div>
  <h1>Echo Transport</h1>

  <dl>
    <dt>order</dt>
    <dd id="order">{order}</dd>

    <dt>stats</dt>
    <dd id="stats">{stats}</dd>

    <dt>room</dt>
    <dd id="room">{room}</dd>

    <dt>secret</dt>
    <dd id="secret">{secret}</dd>

    <dt>news</dt>
    <dd id="news">{news}</dd>

    <dt>socket id header</dt>
    <dd id="socket-id-header">{socketIdHeader ?? 'none'}</dd>
  </dl>

  <pre id="log">{log.join('\n')}</pre>

  <button onclick={showLog}>Show Log</button>
  <button onclick={() => router.reload({ data: { drop: 'stats' } })}>Drop Stats</button>
  <button onclick={() => router.reload({ data: { swap: '1' } })}>Swap Events</button>

  <a href="/socket-id" use:inertia>Leave</a>
</div>
