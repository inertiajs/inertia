<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'

  export let users: { data: { id: number; name: string }[] }
</script>

<div>
  <h1 data-testid="ssr-title">SSR Infinite Scroll</h1>

  <InfiniteScroll data="users" manual>
    <div slot="previous" let:hasMore>
      <p data-testid="has-previous">Has previous: {hasMore}</p>
    </div>

    {#each users.data as user (user.id)}
      <div data-testid="user">{user.name}</div>
    {/each}

    <div slot="next" let:hasMore>
      <p data-testid="has-next">Has next: {hasMore}</p>
    </div>
  </InfiniteScroll>
</div>
