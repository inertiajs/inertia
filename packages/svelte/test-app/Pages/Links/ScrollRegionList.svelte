<script context="module" lang="ts">
  export { default as layout } from '@/Layouts/WithScrollRegion.svelte'
</script>

<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let user_id: number | undefined = undefined

  const users = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))
</script>

<div>
  <span class="text">Scrollable list with scroll region</span>
  <div class="user-text">Clicked user: {user_id || 'none'}</div>

  {#each users as user (user.id)}
    <div style="padding: 20px; border-bottom: 1px solid #ccc">
      <div style="margin-bottom: 10px; width: 500px">{user.name}</div>
      <button on:click={() => router.get(`/links/scroll-region-list/user/${user.id}`)}>Default</button>
      <button on:click={() => router.get(`/links/scroll-region-list/user/${user.id}`, {}, { preserveScroll: true })}>
        Preserve True
      </button>
      <button on:click={() => router.get(`/links/scroll-region-list/user/${user.id}`, {}, { preserveScroll: false })}>
        Preserve False
      </button>
    </div>
  {/each}
</div>
