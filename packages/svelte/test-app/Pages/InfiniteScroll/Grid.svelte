<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px">
  <div slot="loading" style="grid-column: 1 / -1; text-align: center; padding: 20px">Loading more users...</div>

  <svelte:fragment slot="default">
    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </svelte:fragment>
</InfiniteScroll>
