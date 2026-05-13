<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  let { mode, time } = $props<{ mode: string; time: number }>()

  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')

  const options: { mode?: 'overlap' | 'cancel' | 'rest' } = {}

  if (mode === 'overlap' || mode === 'cancel' || mode === 'rest') {
    options.mode = mode as 'overlap' | 'cancel' | 'rest'
  }

  usePoll(interval, {}, options)
</script>

<div>
  <span id="mode">{mode}</span>
  <span id="time">{time}</span>
</div>
