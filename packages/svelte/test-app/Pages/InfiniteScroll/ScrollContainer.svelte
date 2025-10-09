<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<div style="padding: 20px">
  <h1>Infinite Scroll in Container</h1>
  <p>This component scrolls within a fixed-height container, not the full page.</p>

  <!-- Fixed height scrollable container -->
  <div
    data-testid="scroll-container"
    style="height: 400px; width: 100%; border: 2px solid #ccc; overflow-y: auto; background: #f9f9f9; padding: 10px"
  >
    <InfiniteScroll data="users" style="display: grid; gap: 10px">
      <div slot="loading" style="text-align: center; padding: 20px; color: #666">Loading more users...</div>

      {#each users.data as user (user.id)}
        <UserCard {user} />
      {/each}
    </InfiniteScroll>
  </div>

  <p style="margin-top: 20px">Content below the scroll container to verify page doesn't scroll.</p>
</div>
