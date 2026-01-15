<script lang="ts">
  import { Deferred, InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] } | undefined
</script>

<Deferred data="users">
  <svelte:fragment slot="fallback">
    <div>Loading deferred scroll prop...</div>
  </svelte:fragment>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    <div slot="previous" let:hasMore let:loading let:fetch>
      <p>Has more previous items: {hasMore}</p>
      <button on:click={fetch}>
        {loading ? 'Loading previous items...' : 'Load previous items'}
      </button>
    </div>

    {#each users?.data ?? [] as user (user.id)}
      <UserCard {user} />
    {/each}

    <div slot="next" let:hasMore let:loading let:fetch>
      <p>Has more next items: {hasMore}</p>
      <button on:click={fetch}>
        {loading ? 'Loading next items...' : 'Load next items'}
      </button>
    </div>
  </InfiniteScroll>
</Deferred>
