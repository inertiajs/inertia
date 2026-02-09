<script lang="ts">
  import { Deferred, inertia, router } from '@inertiajs/svelte'

  export let withOnly: string[] | undefined = undefined
  export let withExcept: string[] | undefined = undefined
  export let users: Array<{ id: number; name: string }> | undefined = undefined

  const handleTriggerPartialReload = () => {
    router.reload({
      only: withOnly,
      except: withExcept,
    })
  }
</script>

<div>
  <Deferred data="users" let:reloading>
    <svelte:fragment slot="fallback">
      <span>Loading...</span>
    </svelte:fragment>
    {#if reloading}
      <span id="reloading-indicator">Reloading...</span>
    {/if}
    {#each users ?? [] as user (user.id)}
      <span>{user.name}</span>
    {/each}
  </Deferred>
  <button on:click={handleTriggerPartialReload}>Trigger a partial reload</button>
  <a href="/deferred-props/page-1" use:inertia={{ prefetch: 'hover' }}>Prefetch</a>
</div>
