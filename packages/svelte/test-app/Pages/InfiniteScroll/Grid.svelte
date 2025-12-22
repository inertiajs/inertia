<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()
</script>

<InfiniteScroll data="users" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px">
  {#snippet loading()}
    <div style="grid-column: 1 / -1; text-align: center; padding: 20px">Loading more users...</div>
  {/snippet}

  <!-- eslint-disable svelte/no-useless-children-snippet -->
  {#snippet children()}
    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  {/snippet}
  <!-- eslint-enable svelte/no-useless-children-snippet -->
</InfiniteScroll>
