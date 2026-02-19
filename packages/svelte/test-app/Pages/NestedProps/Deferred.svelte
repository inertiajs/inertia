<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  interface Props {
    auth: {
      user?: string
      notifications?: string[]
    }
  }

  let { auth }: Props = $props()
</script>

<p id="user">User: {auth.user}</p>

<Deferred data="auth.notifications">
  {#snippet fallback()}
    <div id="loading">Loading notifications...</div>
  {/snippet}
  <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
</Deferred>
