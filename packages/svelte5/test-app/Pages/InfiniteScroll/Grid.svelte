<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte5'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] };
  }

  let { users }: Props = $props();
</script>

<InfiniteScroll data="users" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px">
  {#snippet loading()}
    <div  style="grid-column: 1 / -1; text-align: center; padding: 20px">Loading more users...</div>
  {/snippet}

  {#snippet children()}
  
      {#each users.data as user (user.id)}
        <UserCard {user} />
      {/each}
    
  {/snippet}
</InfiniteScroll>
