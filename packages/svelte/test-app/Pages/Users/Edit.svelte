<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  interface User {
    id: number
    name: string
    email: string
  }

  export let user: User
  export let withRememberKey: boolean = false

  const form = withRememberKey
    ? useForm('EditUserForm', {
        name: user.name,
        email: user.email,
      })
    : useForm({
        name: user.name,
        email: user.email,
      })
</script>

<div>
  <h1>Edit User {user.id}</h1>
  <p>With remember key: {withRememberKey}</p>
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
