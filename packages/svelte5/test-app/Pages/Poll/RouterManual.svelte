<script lang="ts">
  import { router } from '@inertiajs/svelte5'

  const { start, stop } = router.poll(
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
