<script lang="ts">
  import { isSameUrlWithoutQueryOrHash, router, visitReloadsProps } from '@inertiajs/core'
  import { get } from 'es-toolkit/compat'
  import { page } from '../index'

  interface Props {
    data: string | string[]
    rescue?: import('svelte').Snippet
    fallback?: import('svelte').Snippet
    children?: import('svelte').Snippet<[{ reloading: boolean }]>
  }

  let { data, rescue, fallback, children }: Props = $props()

  const keys = $derived(Array.isArray(data) ? data : [data])
  const rescuedKeys = $derived(new Set(page.rescuedProps))
  const loaded = $derived(keys.every((key) => typeof get(page.props, key) !== 'undefined'))
  const failed = $derived(keys.some((key) => rescuedKeys.has(key)))

  let reloading = $state(false)
  const activeReloads = new Set<object>()

  $effect(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        visitReloadsProps(visit, keys)
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
{:else if failed && rescue}
  {@render rescue?.()}
{:else}
  {@render fallback?.()}
{/if}
