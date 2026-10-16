<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'

  let { name, next }: { name: string; next: string } = $props()

  const prefetchPanel = () => {
    router.prefetch('/layers/panel/first', {}, { cacheFor: '30s' })
  }

  const openPanelInstantly = () => {
    router.visit('/layers/panel/first', { component: 'Layers/Panel' })
  }
</script>

<div id="waypoint">Waypoint {name}</div>

<a href="/layers/waypoint/{next}" use:inertia>Go to the next waypoint</a>

<button onclick={prefetchPanel}>Prefetch the panel</button>
<button onclick={openPanelInstantly}>Instantly open the panel</button>
