<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  let { mode, time } = $props<{ mode: string; time: number }>()

  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')

  const pathMode = window.location.pathname.split('/').pop()

  const options: { mode?: 'allow' | 'cancel' | 'rest' } = {}

  if (pathMode === 'allow' || pathMode === 'cancel' || pathMode === 'rest') {
    options.mode = pathMode as 'allow' | 'cancel' | 'rest'
  }

  usePoll(interval, {}, options)
</script>

<div>
  <span id="mode">{mode}</span>
  <span id="time">{time}</span>
</div>
