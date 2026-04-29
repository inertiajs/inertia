<script lang="ts">
  import { anyPathIsReloaded, isSameUrlWithoutQueryOrHash, router } from '@inertiajs/core'
  import { get } from 'es-toolkit/compat'
  import { page } from '../index'

  interface Props {
    data: string | string[]
    error?: import('svelte').Snippet
    fallback?: import('svelte').Snippet
    children?: import('svelte').Snippet<[{ reloading: boolean }]>
  }

  let { data, error, fallback, children }: Props = $props()

  const keys = $derived(Array.isArray(data) ? data : [data])
  const rescuedKeys = $derived(new Set(page.rescuedProps || []))
  const loaded = $derived(keys.every((key) => typeof get(page.props, key) !== 'undefined'))
  const settled = $derived(keys.every((key) => typeof get(page.props, key) !== 'undefined' || rescuedKeys.has(key)))
  const failed = $derived(settled && keys.some((key) => rescuedKeys.has(key)))

  let reloading = $state(false)
  const activeReloads = new Set<object>()

  $effect(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        anyPathIsReloaded(keys, visit.only, visit.except)
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

{#if loaded && !failed}
  {@render children?.({ reloading })}
{:else if failed && error}
  {@render error?.()}
{:else}
  {@render fallback?.()}
{/if}
