<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  export let mode: string
  export let time: number

  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')

  const initialMode = mode
  const options: { mode?: 'overlap' | 'cancel' | 'rest' } = {}

  if (initialMode === 'overlap' || initialMode === 'cancel' || initialMode === 'rest') {
    options.mode = initialMode
  }

  usePoll(interval, {}, options)
</script>

<div>
  <span id="mode">{mode}</span>
  <span id="time">{time}</span>
</div>
