<script lang="ts">
  import { router, type ReloadOptions } from '@inertiajs/core'
  import { onDestroy, onMount } from 'svelte'

  const {
    data = '',
    params = {},
    buffer = 0,
    as = 'div',
    always = false,
    children,
    fallback,
  }: {
    data?: string | string[]
    params?: ReloadOptions
    buffer?: number
    as?: keyof HTMLElementTagNameMap
    always?: boolean
    children?: any
    fallback?: any
  } = $props()

  let loaded = $state(false)
  let fetching = $state(false)
  let el = $state<HTMLElement>()
  let observer = $state<IntersectionObserver | null>(null)

  onMount(() => {
    if (!el) {
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (!always) {
          observer?.disconnect()
        }

        if (fetching) {
          return
        }

        fetching = true

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          onStart: (event) => {
            fetching = true
            reloadParams.onStart?.(event)
          },
          onFinish: (event) => {
            loaded = true
            fetching = false
            reloadParams.onFinish?.(event)
          },
        })
      },
      {
        rootMargin: `${buffer}px`,
      },
    )

    observer.observe(el)
  })

  onDestroy(() => {
    observer?.disconnect()
  })

  function getReloadParams(): Partial<ReloadOptions> {
    if (data !== '') {
      return {
        only: (Array.isArray(data) ? data : [data]) as string[],
      }
    }

    if (!params.data) {
      throw new Error('You must provide either a `data` or `params` prop.')
    }

    return params
  }
</script>

{#if always || !loaded}
  <svelte:element this={as} bind:this={el} />
{/if}

{#if loaded}
  {@render children?.()}
{:else if fallback}
  {@render fallback?.()}
{/if}
