<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'

  interface Props {
    users: { data: { id: number; name: string }[] }
  }

  let { users }: Props = $props()

  let reversedUsers = $derived([...users.data].reverse())
</script>

<div style="display: flex; flex-direction: column; height: 100vh">
  <div style="padding: 10px; border-bottom: 1px solid #ccc; flex-shrink: 0">Header</div>

  <div data-testid="scroll-container" style="flex: 1; overflow-y: auto">
    <InfiniteScroll data="users" style="display: grid; gap: 4px; padding: 20px" reverse>
      {#snippet loading()}
        <div style="text-align: center; padding: 10px">Loading...</div>
      {/snippet}

      {#each reversedUsers as user (user.id)}
        <div data-user-id={user.id} style="padding: 4px 8px; border: 1px solid #ddd; font-size: 13px">
          {user.name}
        </div>
      {/each}
    </InfiniteScroll>
  </div>

  <div style="padding: 10px; border-top: 1px solid #ccc; flex-shrink: 0">Footer</div>
</div>
