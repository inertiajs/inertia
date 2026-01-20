<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<div>
  <h1>Infinite Scroll with Invisible First Child</h1>

  <InfiniteScroll data="users" style="display: grid; gap: 20px">
    <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

    <div style="display: none">Hidden first element</div>

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>
</div>
