<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'

  interface Props {
    users: { data: { id: number; name: string }[] }
  }

  let { users }: Props = $props()
</script>

<div>
  <h1 data-testid="ssr-title">SSR Infinite Scroll</h1>

  <InfiniteScroll data="users" manual>
    {#snippet previous({ hasMore })}
      <div>
        <p data-testid="has-previous">Has previous: {hasMore}</p>
      </div>
    {/snippet}

    {#each users.data as user (user.id)}
      <div data-testid="user">{user.name}</div>
    {/each}

    {#snippet next({ hasMore })}
      <div>
        <p data-testid="has-next">Has next: {hasMore}</p>
      </div>
    {/snippet}
  </InfiniteScroll>
</div>
