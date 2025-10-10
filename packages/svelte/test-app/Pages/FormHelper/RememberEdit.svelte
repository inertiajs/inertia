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
      <label for="name">Name:</label>
      <input type="text" bind:value={$form.name} name="name" />
    </div>
    <div>
      <label for="email">Email:</label>
      <input type="email" bind:value={$form.email} name="email" />
    </div>
  </form>
</div>
