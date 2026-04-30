<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'

  interface Props {
    auth: {
      user?: string
      token?: string
      notifications?: string[]
    }
    status: string
  }

  let { auth, status }: Props = $props()
</script>

<p id="user">User: {auth.user}</p>
<p id="token">Token: {auth.token}</p>
<p id="status">Status: {status}</p>

<Deferred data="auth.notifications">
  {#snippet fallback()}
    <div id="loading">Loading notifications...</div>
  {/snippet}

  {#snippet rescue()}
    <button id="reload-except" onclick={() => router.reload({ except: ['auth.notifications'] })}>
      Reload without notifications
    </button>
  {/snippet}

  <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
</Deferred>
