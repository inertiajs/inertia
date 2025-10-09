<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  interface User {
    id: number
    name: string
    email: string
  }

  export let user: User

  const form = useForm('EditUserForm', {
    name: user.name,
    email: user.email,
  })
</script>

<div>
  <h1>Edit User {user.id}</h1>
  <form>
    <div>
      <label>Name:</label>
      <input type="text" bind:value={$form.name} />
    </div>
    <div>
      <label>Email:</label>
      <input type="email" bind:value={$form.email} />
    </div>
  </form>
</div>
