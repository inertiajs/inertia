<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  interface Props {
    message: string | undefined
  }

  let { message }: Props = $props()
</script>

<Deferred data="message">
  {#snippet fallback()}
    <div id="fallback">Loading message...</div>
  {/snippet}
  <div id="message">{message}</div>
</Deferred>
