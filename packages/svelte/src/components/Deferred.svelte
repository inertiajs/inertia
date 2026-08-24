<script lang="ts">
  import { partialReloadFillsDeferred, router } from '@inertiajs/core'
  import { get } from 'es-toolkit/compat'
  import { usePage } from '../index'
  import { layerId } from '../page.svelte'

  interface Props {
    data: string | string[]
    rescue?: import('svelte').Snippet<[{ reloading: boolean }]>
    fallback?: import('svelte').Snippet
    children?: import('svelte').Snippet<[{ reloading: boolean }]>
  }

  let { data, rescue, fallback, children }: Props = $props()

  const page = usePage()
  const keys = $derived(Array.isArray(data) ? data : [data])
  const rescuedKeys = $derived(new Set(page.rescuedProps))
  const loaded = $derived(keys.every((key) => typeof get(page.props, key) !== 'undefined'))
  const failed = $derived(keys.some((key) => rescuedKeys.has(key)))

  let reloading = $state(false)
  const currentLayerId = layerId()
  const activeReloads = new Set<object>()

  $effect(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (partialReloadFillsDeferred(visit, { layerId: currentLayerId, url: page.url }, keys)) {
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
  {@render rescue?.({ reloading })}
{:else}
  {@render fallback?.()}
{/if}
