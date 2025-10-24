<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }

  $: reversedUsers = [...users.data].reverse()
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" reverse autoScroll={false}>
  <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

  {#each reversedUsers as user (user.id)}
    <UserCard {user} />
  {/each}
</InfiniteScroll>
