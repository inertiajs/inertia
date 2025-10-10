<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<div>
  <h1>Empty Dataset Test</h1>
  <InfiniteScroll data="users" style="display: grid; gap: 20px">
    <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}

    {#if users.data.length === 0}
      <div style="text-align: center; padding: 40px; color: #666">No users found.</div>
    {/if}
  </InfiniteScroll>
</div>
