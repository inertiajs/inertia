<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import type { User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()
</script>

<div style="overflow-x: hidden">
  <InfiniteScroll data="users">
    {#each users.data as user (user.id)}
      <div data-user-id={user.id}>
        <div>{user.name}</div>
      </div>
    {/each}
  </InfiniteScroll>
</div>
