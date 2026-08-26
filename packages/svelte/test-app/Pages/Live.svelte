<script lang="ts">
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
  let lastEvent = $state('none')
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

      lastEvent = [
        event.detail.channel.type,
        event.detail.channel.name,
        event.detail.event,
        event.detail.props.join('|'),
        JSON.stringify(event.detail.payload),
      ].join(' ')

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

    <dt>last event</dt>
    <dd id="last-event">{lastEvent}</dd>

    <dt>subscriptions</dt>
    <dd id="subscriptions">{subscriptions.join(', ') || 'none'}</dd>

    <dt>subscription count</dt>
    <dd id="subscription-count">{subscriptions.length}</dd>
  </dl>

  <button onclick={showSubscriptions}>Show Subscriptions</button>
  <button onclick={() => (cancel = !cancel)}>Toggle Cancel</button>
  <button onclick={() => router.reload({ only: ['plain'] })}>Reload Plain</button>

  <a href="/socket-id" use:inertia>Leave</a>
</div>
