<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  let { mode, time } = $props<{ mode: string; time: number }>()

  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')

  // svelte-ignore state_referenced_locally
  const initialMode = mode
  const options: { mode?: 'overlap' | 'cancel' | 'rest'; keepAlive?: boolean } = {}

  if (initialMode === 'overlap' || initialMode === 'cancel' || initialMode === 'rest') {
    options.mode = initialMode
  }

  if (params.get('keepAlive') === '1') {
    options.keepAlive = true
  }

  const { start, stop } = usePoll(interval, {}, options)
</script>

<div>
  <span id="mode">{mode}</span>
  <span id="time">{time}</span>
  <button onclick={stop}>Stop</button>
  <button onclick={start}>Start</button>
</div>
