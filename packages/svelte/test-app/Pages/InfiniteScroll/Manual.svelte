<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
  <div slot="before" let:exposedBefore>
    <p>Has more previous items: {exposedBefore.hasMore}</p>
    <button on:click={exposedBefore.fetch}>
      {exposedBefore.loading ? 'Loading previous items...' : 'Load previous items'}
    </button>
  </div>

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  <div slot="after" let:exposedAfter>
    <p>Has more next items: {exposedAfter.hasMore}</p>
    <button on:click={exposedAfter.fetch}>
      {exposedAfter.loading ? 'Loading next items...' : 'Load next items'}
    </button>
  </div>
</InfiniteScroll>
