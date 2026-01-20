<script context="module" lang="ts">
  export { default as layout } from '@/Layouts/WithScrollRegion.svelte'
</script>

<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import type { VisitHelperOptions } from '@inertiajs/core'

  export let user_id: number | undefined = undefined

  const users = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))

  const navigate = (id: number, options: VisitHelperOptions = {}) => {
    router.get(`/links/scroll-region-list/user/${id}`, {}, options)
  }
</script>

<div>
  <span class="text">Scrollable list with scroll region</span>
  <div class="user-text">Clicked user: {user_id || 'none'}</div>

  {#each users as user (user.id)}
    <div style="padding: 20px; border-bottom: 1px solid #ccc">
      <div style="margin-bottom: 10px; width: 500px">{user.name}</div>
      <button on:click={() => navigate(user.id)}>Default</button>
      <button on:click={() => navigate(user.id, { preserveScroll: true })}> Preserve True </button>
      <button on:click={() => navigate(user.id, { preserveScroll: false })}> Preserve False </button>
    </div>
  {/each}
</div>
