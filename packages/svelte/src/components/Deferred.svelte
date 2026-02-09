<script lang="ts">
  import { isSameUrlWithoutQueryOrHash, router } from '@inertiajs/core'
  import { onMount } from 'svelte'
  import { page } from '../index'

  export let data: string | string[]

  const keys = Array.isArray(data) ? data : [data]

  // Synchronously derive loaded state from current props
  // This ensures we never render slot content when props are undefined
  $: loaded = keys.every((key) => typeof $page.props[key] !== 'undefined')

  let reloading = false
  const activeReloads = new Set<object>()

  const keysAreBeingReloaded = (only: string[], except: string[], keys: string[]): boolean => {
    if (only.length === 0 && except.length === 0) {
      return true
    }

    if (only.length > 0) {
      return keys.some((key) => only.includes(key))
    }

    return keys.some((key) => !except.includes(key))
  }

  onMount(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        keysAreBeingReloaded(visit.only, visit.except, keys)
      ) {
        activeReloads.add(visit)
        reloading = true
      }
    })

    const removeFinishListener = router.on('finish', (e) => {
      const visit = e.detail.visit

      if (activeReloads.has(visit)) {
        activeReloads.delete(visit)
        reloading = activeReloads.size > 0
      }
    })

    return () => {
      removeStartListener()
      removeFinishListener()
      activeReloads.clear()
    }
  })

  if (!$$slots.fallback) {
    throw new Error('`<Deferred>` requires a `<svelte:fragment slot="fallback">` slot')
  }
</script>

{#if loaded}
  <slot {reloading} />
{:else}
  <slot name="fallback" />
{/if}
