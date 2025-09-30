<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
  <div slot="previous" let:exposedPrevious>
    <p>Has more previous items: {exposedPrevious.hasMore}</p>
    <button on:click={exposedPrevious.fetch}>
      {exposedPrevious.loading ? 'Loading previous items...' : 'Load previous items'}
    </button>
  </div>

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  <div slot="next" let:exposedNext>
    <p>Has more next items: {exposedNext.hasMore}</p>
    <button on:click={exposedNext.fetch}>
      {exposedNext.loading ? 'Loading next items...' : 'Load next items'}
    </button>
  </div>
</InfiniteScroll>
