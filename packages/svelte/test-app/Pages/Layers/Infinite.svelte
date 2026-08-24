<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from '../InfiniteScroll/UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()
</script>

<div>Infinite layer</div>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
  {#snippet previous({ hasMore, loading, fetch })}
    <button onclick={fetch}>{loading ? 'Loading previous items...' : 'Load previous items'}</button>
    <span>Has more previous: {hasMore}</span>
  {/snippet}

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  {#snippet next({ hasMore, loading, fetch })}
    <button onclick={fetch}>{loading ? 'Loading next items...' : 'Load next items'}</button>
    <span>Has more next: {hasMore}</span>
  {/snippet}
</InfiniteScroll>
