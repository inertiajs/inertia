<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  const { start, stop } = usePoll(
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

<button onclick={() => start()}>Start</button>
<button onclick={() => stop()}>Stop</button>
