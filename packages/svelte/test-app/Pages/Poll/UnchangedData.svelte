<script lang="ts">
  import { usePoll } from '@inertiajs/svelte'

  usePoll(500, {
    only: ['custom_prop'],
  })
</script>

<div />
