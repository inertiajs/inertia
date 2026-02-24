<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let {
    auth,
  }: {
    auth: {
      user: {
        name: string
        email: string
        permissions?: string[]
      }
    }
  } = $props()
</script>

<p id="name">Name: {auth.user.name}</p>
<p id="email">Email: {auth.user.email}</p>
<p id="permissions">Permissions: {auth.user.permissions?.join(', ')}</p>
<button onclick={() => router.reload({ only: ['auth.user.permissions'] })}>Reload Permissions</button>
