<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" buffer={200} onlyPrevious style="display: grid; gap: 20px">
  <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}
</InfiniteScroll>
