<script lang="ts">
  import { router, type ReloadOptions } from '@inertiajs/core'
  import { usePage } from '../page.svelte'

  interface Props {
    data?: string | string[]
    params?: ReloadOptions
    buffer?: number
    as?: keyof HTMLElementTagNameMap
    always?: boolean
    children?: import('svelte').Snippet
    fallback?: import('svelte').Snippet
  }

  let { data = '', params = {}, buffer = 0, as = 'div', always = false, children, fallback }: Props = $props()

  let loaded = $state(false)
  let fetching = false
  let observer: IntersectionObserver | null = null

  const page = usePage()

  // Watch for page prop changes and reset loaded state when data becomes undefined
  $effect(() => {
    if (Array.isArray(data)) {
      // For arrays, reset loaded if any prop becomes undefined
      if (data.some((key) => page.props[key] === undefined)) {
        loaded = false
      }
    } else if (page.props[data as string] === undefined) {
      loaded = false
    }
  })

  function attachObserver(el: HTMLElement) {
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (fetching) {
          return
        }

        if (!always && loaded) {
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

            if (!always) {
              observer?.disconnect()
            }
          },
        })
      },
      {
        rootMargin: `${buffer}px`,
      },
    )

    observer.observe(el)

    // Clean up will run like onDestroy
    return () => {
      observer?.disconnect()
    }
  }

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
  <svelte:element this={as} {@attach attachObserver} />
{/if}

{#if loaded}
  {@render children?.()}
{:else if fallback}
  {@render fallback?.()}
{/if}
