<script lang="ts">
  import { InfiniteScroll, Link } from '@inertiajs/svelte'
  import UserCard, { type User } from '../InfiniteScroll/UserCard.svelte'

  interface Props {
    term: string | null
    users: { data: User[] }
  }

  let { term, users }: Props = $props()
</script>

<div>
  <p id="term">Term: {term ?? 'nothing'}</p>

  <Link method="query" href="/query-visits/infinite-scroll" data={{ term: 'Apple' }}>Search Apple</Link>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    {#each users.data as user (user.id)}
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
</div>
