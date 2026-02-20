<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let {
    auth,
  }: {
    auth: {
      user: string
      token?: string
      sessionId?: string
    }
  } = $props()
</script>

<p id="user">User: {auth.user}</p>
<p id="token">Token: {auth.token}</p>
<p id="session-id">Session: {auth.sessionId}</p>
<button onclick={() => router.reload({ except: ['auth.token'] })}>Reload Without Token</button>
<button onclick={() => router.reload({ except: ['auth.token', 'auth.sessionId'] })}
  >Reload Without Token and Session</button
>
