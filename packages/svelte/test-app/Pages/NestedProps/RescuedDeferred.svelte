<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'

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

  {#snippet rescue()}
    <button id="retry" onclick={() => router.reload({ only: ['auth'], headers: { 'X-Test-Retry': 'true' } })}>Retry auth</button>
  {/snippet}

  <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
</Deferred>
