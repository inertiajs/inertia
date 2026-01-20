<script lang="ts">
  import { InfiniteScroll, page } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }

  window.testing = {
    ...(window.testing || {}),
    get pageUrl() {
      return $page.url
    },
  }
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px">
  <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}
</InfiniteScroll>
