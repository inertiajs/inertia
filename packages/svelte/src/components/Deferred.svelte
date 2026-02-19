<script lang="ts">
  import { isSameUrlWithoutQueryOrHash, router } from '@inertiajs/core'
  import { page } from '../index'

  interface Props {
    data: string | string[]
    fallback?: import('svelte').Snippet
    children?: import('svelte').Snippet<[{ reloading: boolean }]>
  }

  let { data, fallback, children }: Props = $props()

  const keys = $derived(Array.isArray(data) ? data : [data])
  const loaded = $derived(keys.every((key) => typeof page.props[key] !== 'undefined'))

  let reloading = $state(false)
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

  $effect(() => {
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

  $effect.pre(() => {
    if (!fallback) {
      throw new Error('`<Deferred>` requires a `fallback` snippet')
    }
  })
</script>

{#if loaded}
  {@render children?.({ reloading })}
{:else}
  {@render fallback?.()}
{/if}
