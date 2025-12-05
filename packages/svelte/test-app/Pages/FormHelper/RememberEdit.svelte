<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  interface User {
    id: number
    name: string
    email: string
  }

  interface Props {
    user: User
  }

  let { user }: Props = $props()

  // svelte-ignore state_referenced_locally
  const form = useForm('EditUserForm', {
    name: user.name,
    email: user.email,
  })
</script>

<div>
  <h1>Edit User {user.id}</h1>
  <form>
    <div>
      <label for="name">Name:</label>
      <input id="name" type="text" bind:value={form.name} />
    </div>
    <div>
      <label for="email">Email:</label>
      <input id="email" type="email" bind:value={form.email} />
    </div>
  </form>
</div>
