<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()

  let reversedUsers = $derived([...users.data].reverse())
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" reverse autoScroll={false}>
  {#snippet loading()}
    <div style="text-align: center; padding: 20px">Loading...</div>
  {/snippet}

  {#each reversedUsers as user (user.id)}
    <UserCard {user} />
  {/each}
</InfiniteScroll>
