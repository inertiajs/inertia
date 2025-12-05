<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users1: { data: User[] }
    users2: { data: User[] }
  }

  let { users1, users2 }: Props = $props()
</script>

<div style="padding: 20px">
  <h1>Dual Sibling InfiniteScroll</h1>
  <p style="margin-bottom: 20px">Two InfiniteScroll components side by side, sharing the window scroll</p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px">
    <div>
      <h2>Users 1</h2>
      <InfiniteScroll data="users1" style="display: grid; gap: 20px" manual>
        {#each users1.data as user (user.id)}
          <UserCard {user} />
        {/each}

        {#snippet next({ exposedNext })}
          <div style="text-align: center; padding: 20px">
            <button onclick={exposedNext.fetch} disabled={exposedNext.loading}>
              {exposedNext.loading ? 'Loading...' : 'Load More Users 1'}
            </button>
          </div>
        {/snippet}
      </InfiniteScroll>
    </div>

    <div>
      <h2>Users 2</h2>
      <InfiniteScroll data="users2" style="display: grid; gap: 20px" manual>
        {#each users2.data as user (user.id)}
          <UserCard {user} />
        {/each}

        {#snippet next({ exposedNext })}
          <div style="text-align: center; padding: 20px">
            <button onclick={exposedNext.fetch} disabled={exposedNext.loading}>
              {exposedNext.loading ? 'Loading...' : 'Load More Users 2'}
            </button>
          </div>
        {/snippet}
      </InfiniteScroll>
    </div>
  </div>
</div>
