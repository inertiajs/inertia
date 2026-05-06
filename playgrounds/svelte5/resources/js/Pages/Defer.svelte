<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'

  interface Props {
    users?: { id: number; name: string; email: string }[]
    foods?: { id: number; name: string }[]
    organizations?: { id: number; name: string; url: string }[]
    stats?: { visitors: number; revenue: number } | null
  }

  let { users, foods, organizations, stats }: Props = $props()

  const retryStats = () => {
    router.reload({
      only: ['stats'],
      headers: { 'X-Rescue-Prop-Success': 'true' },
    })
  }
</script>

<svelte:head>
  <title>Deferred Props</title>
</svelte:head>

<h1 class="text-3xl">Deferred Props</h1>

<div class="mt-6 rounded-sm border border-yellow-500 bg-yellow-200 p-4">
  <p>Page is loaded!</p>
</div>

<div class="mt-6 grid grid-cols-2 gap-4">
  <div class="rounded-sm border border-gray-200 p-4">
    <Deferred data="users">
      {#snippet fallback()}
        <p>Loading Users...</p>
      {/snippet}

      {#each users ?? [] as user}
        <p>#{user.id}: {user.name} ({user.email})</p>
      {/each}
    </Deferred>
  </div>

  <div class="rounded-sm border border-gray-200 p-4">
    <Deferred data="foods">
      {#snippet fallback()}
        <p>Loading Foods...</p>
      {/snippet}

      {#each foods ?? [] as food}
        <p>#{food.id}: {food.name}</p>
      {/each}
    </Deferred>
  </div>

  <div class="rounded-sm border border-gray-200 p-4">
    <Deferred data="organizations">
      {#snippet fallback()}
        <p>Loading Organizations...</p>
      {/snippet}

      {#each organizations ?? [] as org}
        <p>#{org.id}: {org.name} ({org.url})</p>
      {/each}
    </Deferred>
  </div>

  <div class="rounded-sm border border-gray-200 p-4">
    <Deferred data="stats">
      {#snippet fallback()}
        <p>Loading Stats...</p>
      {/snippet}

      {#snippet rescue({ reloading })}
        <div class="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">
          <p class="font-semibold">Unable to load stats.</p>
          <button
            type="button"
            onclick={retryStats}
            disabled={reloading}
            class="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {reloading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      {/snippet}

      {#if stats}
        <dl class="grid grid-cols-2 gap-4">
          <div>
            <dt class="text-sm text-gray-500">Visitors</dt>
            <dd class="text-2xl font-semibold">{stats.visitors}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Revenue</dt>
            <dd class="text-2xl font-semibold">${stats.revenue}</dd>
          </div>
        </dl>
      {/if}
    </Deferred>
  </div>
</div>
