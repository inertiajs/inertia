<script lang="ts">
  import { usePoll } from '@inertiajs/svelte5'

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

<button on:click={() => start()}>Start</button>
<button on:click={() => stop()}>Stop</button>
