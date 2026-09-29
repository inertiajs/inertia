<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  const poll = usePoll(
    500,
    {
      only: ['custom_prop'],
      onFinish() {
        console.log('hook poll finished')
      },
    },
    {
      autoStart: false,
    },
  )
</script>

<button onclick={() => poll.start()}>Start</button>
<button onclick={() => poll.stop()}>Stop</button>
<div>Polling: {poll.polling ? 'yes' : 'no'}</div>
