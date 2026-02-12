<script lang="ts">
  import { InfiniteScroll, page, router } from '@inertiajs/svelte'

  export let users: { data: { id: number; name: string }[] }

  let flashEventCount = 0

  router.on('flash', () => {
    flashEventCount++
  })
</script>

<div>
  <span id="flash">{JSON.stringify($page.flash)}</span>
  <span id="flash-event-count">{flashEventCount}</span>

  <InfiniteScroll data="users" style="display: grid; gap: 20px">
    {#each users.data as user (user.id)}
      <div style="height: 15vh; border: 1px solid #ccc">
        {user.name}
      </div>
    {/each}
  </InfiniteScroll>
</div>
