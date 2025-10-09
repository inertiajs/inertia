<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface User {
    id: number
    name: string
    email: string
  }

  export let users: User[]
</script>

<div>
  <h1>Users Index</h1>
  <ul>
    {#each users as user (user.id)}
      <li>
        <Link href="/remember/users/{user.id}/edit">Edit {user.name}</Link>
      </li>
    {/each}
  </ul>
</div>
