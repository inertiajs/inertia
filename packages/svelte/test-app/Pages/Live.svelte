<script lang="ts">
  import type { LiveEventDetails } from '@inertiajs/core'
  import { inertia, router } from '@inertiajs/svelte'
  import { onDestroy, onMount } from 'svelte'

  let {
    order,
    stats,
    feed,
    throttled,
    notes,
    multi,
    plain,
    account,
    socketIdHeader,
  }: {
    order: string
    stats: string
    feed: string
    throttled: string
    notes: string
    multi: string
    plain: string
    account: { balance: string; currency: string }
    socketIdHeader: string | null
  } = $props()

  let events = $state(0)
  let lastEvent = $state<LiveEventDetails | null>(null)
  let cancel = $state(false)
  let subscriptions = $state<string[]>([])

  const showSubscriptions = () => {
    subscriptions = window.__inertiaLive.subscriptions()
  }

  let stopListening: VoidFunction | null = null

  onMount(() => {
    showSubscriptions()

    stopListening = router.on('live', (event) => {
      events++

      lastEvent = event.detail

      if (cancel) {
        return false
      }
    })
  })

  onDestroy(() => {
    stopListening?.()
    stopListening = null
  })
</script>

<div>
  <h1>Live Props</h1>

  <dl>
    <dt>order</dt>
    <dd id="order">{order}</dd>

    <dt>stats</dt>
    <dd id="stats">{stats}</dd>

    <dt>feed</dt>
    <dd id="feed">{feed}</dd>

    <dt>throttled</dt>
    <dd id="throttled">{throttled}</dd>

    <dt>notes</dt>
    <dd id="notes">{notes}</dd>

    <dt>multi</dt>
    <dd id="multi">{multi}</dd>

    <dt>plain</dt>
    <dd id="plain">{plain}</dd>

    <dt>account.balance</dt>
    <dd id="account-balance">{account.balance}</dd>

    <dt>account.currency</dt>
    <dd id="account-currency">{account.currency}</dd>

    <dt>socket id header</dt>
    <dd id="socket-id-header">{socketIdHeader ?? 'none'}</dd>

    <dt>events</dt>
    <dd id="events">{events}</dd>

    <dt>last channel</dt>
    <dd id="last-channel">{lastEvent ? `${lastEvent.channel.type}:${lastEvent.channel.name}` : 'none'}</dd>

    <dt>last event</dt>
    <dd id="last-event">{lastEvent?.event ?? 'none'}</dd>

    <dt>last props</dt>
    <dd id="last-props">{lastEvent?.props.join(', ') ?? 'none'}</dd>

    <dt>last payload</dt>
    <dd id="last-payload">{lastEvent ? JSON.stringify(lastEvent.payload) : 'none'}</dd>

    <dt>subscriptions</dt>
    <dd id="subscriptions">{subscriptions.join(', ') || 'none'}</dd>

    <dt>subscription count</dt>
    <dd id="subscription-count">{subscriptions.length}</dd>
  </dl>

  <button onclick={showSubscriptions}>Show Subscriptions</button>
  <button onclick={() => (cancel = !cancel)}>Toggle Cancel: {cancel}</button>
  <button onclick={() => router.reload({ only: ['plain'] })}>Reload Plain</button>

  <a href="/socket-id" use:inertia>Leave</a>
</div>
