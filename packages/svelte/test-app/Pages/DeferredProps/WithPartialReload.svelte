<script lang="ts">
  import { Deferred, inertia, router } from '@inertiajs/svelte'

  interface Props {
    withOnly?: string[]
    withExcept?: string[]
    users?: Array<{ id: number; name: string }>
  }

  let { withOnly, withExcept, users }: Props = $props()

  const handleTriggerPartialReload = () => {
    router.reload({
      only: withOnly,
      except: withExcept,
    })
  }
</script>

<div>
  <Deferred data="users">
    {#snippet fallback()}
      <span>Loading...</span>
    {/snippet}
    {#snippet children({ reloading })}
      {#if reloading}
        <span id="reloading-indicator">Reloading...</span>
      {/if}
      {#each users ?? [] as user (user.id)}
        <span>{user.name}</span>
      {/each}
    {/snippet}
  </Deferred>
  <button onclick={handleTriggerPartialReload}>Trigger a partial reload</button>
  <a href="/deferred-props/page-1" use:inertia={{ prefetch: 'hover' }}>Prefetch</a>
</div>
