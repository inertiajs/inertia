<script lang="ts">
  import { inertia, InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<div>
  <a href="/infinite-scroll" use:inertia>Go back to Links</a>
  <InfiniteScroll data="users" style="display: grid; gap: 20px">
    <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>
</div>
