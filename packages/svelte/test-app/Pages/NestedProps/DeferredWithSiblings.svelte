<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  let {
    auth,
  }: {
    auth: {
      user?: { name: string; email: string }
      token?: string
      notifications?: string[]
      roles?: string[]
    }
  } = $props()
</script>

<p id="user">User: {auth.user?.name} ({auth.user?.email})</p>
<p id="token">Token: {auth.token}</p>

<Deferred data={['auth.notifications', 'auth.roles']}>
  {#snippet fallback()}
    <div id="loading">Loading...</div>
  {/snippet}

  <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
  <p id="roles">Roles: {auth.roles?.join(', ')}</p>
</Deferred>
