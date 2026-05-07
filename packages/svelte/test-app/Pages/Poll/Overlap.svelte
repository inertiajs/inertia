<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  let { mode, time } = $props<{ mode: string; time: number }>()

  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')
  const timeoutParam = params.get('timeout')
  const timeout = timeoutParam ? parseInt(timeoutParam) : undefined

  const pathMode = window.location.pathname.split('/').pop()

  const options: { overlap?: 'allow' | 'skip' | 'cancel' } = {}

  if (pathMode === 'skip') {
    options.overlap = 'skip'
  }

  if (pathMode === 'cancel') {
    options.overlap = 'cancel'
  }

  if (pathMode === 'allow') {
    options.overlap = 'allow'
  }

  const requestOptions: { timeout?: number } = {}

  if (timeout !== undefined) {
    requestOptions.timeout = timeout
  }

  usePoll(interval, requestOptions, options)
</script>

<div>
  <span id="mode">{mode}</span>
  <span id="time">{time}</span>
</div>
