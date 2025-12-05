<script lang="ts">
  import { router } from '@inertiajs/svelte'

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

<button onclick={() => start()}>Start</button>
<button onclick={() => stop()}>Stop</button>
