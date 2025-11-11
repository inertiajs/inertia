<script lang="ts">
  import { inertia, usePoll } from '@inertiajs/svelte5'

  usePoll(500, {
    only: ['custom_prop'],
    onFinish() {
      console.log('hook poll finished')
    },
  })
</script>

<a href="/" use:inertia>Home</a>
