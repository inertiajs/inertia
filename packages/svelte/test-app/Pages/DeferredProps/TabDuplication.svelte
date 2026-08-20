<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  export let message: string | undefined
</script>

<Deferred data="message">
  <svelte:fragment slot="fallback">
    <div id="fallback">Loading message...</div>
  </svelte:fragment>
  <div id="message">{message}</div>
</Deferred>
