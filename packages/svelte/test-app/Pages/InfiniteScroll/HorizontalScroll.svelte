<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<div style="height: 120px; overflow-x: scroll; display: flex; width: 100vw">
  <InfiniteScroll data="users" style="display: flex; gap: 20px; height: 120px">
    <div
      slot="loading"
      style="min-width: 150px; height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin-left: 20px; margin-right: 20px"
    >
      Loading...
    </div>

    {#each users.data as user (user.id)}
      <div
        data-user-id={user.id}
        style="min-width: 200px; height: 100px; border: 1px solid #ccc; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; flex: none"
      >
        {user.name}
      </div>
    {/each}
  </InfiniteScroll>
</div>
