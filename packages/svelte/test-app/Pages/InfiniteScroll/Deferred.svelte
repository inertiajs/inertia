<script lang="ts">
  import { Deferred, InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] } | undefined
  }

  let { users }: Props = $props()
</script>

<Deferred data="users">
  {#snippet fallback()}
    <div>Loading deferred scroll prop...</div>
  {/snippet}

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    {#snippet previous({ hasMore, loading, fetch })}
      <div>
        <p>Has more previous items: {hasMore}</p>
        <button onclick={fetch}>
          {loading ? 'Loading previous items...' : 'Load previous items'}
        </button>
      </div>
    {/snippet}

    {#each users?.data ?? [] as user (user.id)}
      <UserCard {user} />
    {/each}

    {#snippet next({ hasMore, loading, fetch })}
      <div>
        <p>Has more next items: {hasMore}</p>
        <button onclick={fetch}>
          {loading ? 'Loading next items...' : 'Load next items'}
        </button>
      </div>
    {/snippet}
  </InfiniteScroll>
</Deferred>
