<script context="module" lang="ts">
  declare global {
    interface Window {
      _inertia_flash_events: unknown[]
      _inertia_flash_layout_id: string | undefined
    }
  }

  window._inertia_flash_events = window._inertia_flash_events || []
</script>

<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let layoutId: string | null = null
  let flashCount = window._inertia_flash_events.length

  onMount(() => {
    layoutId = crypto.randomUUID()
    window._inertia_flash_layout_id = layoutId

    return router.on('flash', (event) => {
      window._inertia_flash_events.push(event.detail.flash)
      flashCount = window._inertia_flash_events.length
    })
  })
</script>

<div>
  <span class="layout-id">{layoutId}</span>
  <span class="flash-count">{flashCount}</span>
  <slot />
</div>
