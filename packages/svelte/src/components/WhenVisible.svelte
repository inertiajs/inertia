<script lang="ts">
  import { router, type ReloadOptions } from '@inertiajs/core'
  import { usePage } from '../page.svelte'

  interface Props {
    data?: string | string[]
    params?: ReloadOptions
    buffer?: number
    as?: keyof HTMLElementTagNameMap
    always?: boolean
    children?: import('svelte').Snippet<[any]>
    fallback?: import('svelte').Snippet
  }

  let { data = '', params = {}, buffer = 0, as = 'div', always = false, children, fallback }: Props = $props()

  let keys = $derived(data ? (Array.isArray(data) ? data : [data]) : [])
  let loaded = $derived(keys.length > 0 && keys.every((key) => page.props[key] !== undefined))
  let fetching = $state(false)
  let observer: IntersectionObserver | null = null

  const page = usePage()

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
    const reloadParams: Partial<ReloadOptions> = { preserveErrors: true, ...params }

    if (data !== '') {
      reloadParams.only = (Array.isArray(data) ? data : [data]) as string[]
    }

    return reloadParams
  }
</script>

{#if always || !loaded}
  <svelte:element this={as} {@attach attachObserver} />
{/if}

{#if loaded}
  {@render children?.({ fetching })}
{:else if fallback}
  {@render fallback?.()}
{/if}
