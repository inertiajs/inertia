<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  interface Props {
    user: { name: string; email: string }
    items: string[]
    count: number
  }

  let { user, items, count }: Props = $props()
</script>

<div>
  <h1 data-testid="ssr-title">SSR Page 1</h1>

  <div data-testid="user-info">
    <p data-testid="user-name">Name: {user.name}</p>
    <p data-testid="user-email">Email: {user.email}</p>
  </div>

  <ul data-testid="items-list">
    {#each items as item (item)}
      <li data-testid="item">{item}</li>
    {/each}
  </ul>

  <p data-testid="count">Count: {count}</p>

  <a href="/ssr/page2" use:inertia data-testid="navigate-link">Navigate to another page</a>
</div>
