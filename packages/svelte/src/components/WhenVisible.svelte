<script lang="ts">
  import { router, type ReloadOptions } from '@inertiajs/core'
  import { onDestroy } from 'svelte'
  import { usePage } from '../page'

  export let data: string | string[] = ''
  export let params: ReloadOptions = {}
  export let buffer: number = 0
  export let as: keyof HTMLElementTagNameMap = 'div'
  export let always: boolean = false

  let loaded = false
  let fetching = false
  let el: HTMLElement
  let observer: IntersectionObserver | null = null

  const page = usePage()
  $: keys = data ? (Array.isArray(data) ? data : [data]) : []
  $: loaded = keys.length > 0 && keys.every((key) => $page.props[key] !== undefined)

  $: if (el && (!loaded || always)) {
    registerObserver()
  }

  function registerObserver() {
    observer?.disconnect()

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
  }

  onDestroy(() => {
    observer?.disconnect()
  })

  function getReloadParams(): Partial<ReloadOptions> {
    const reloadParams: Partial<ReloadOptions> = { ...params }

    if (data !== '') {
      reloadParams.only = (Array.isArray(data) ? data : [data]) as string[]
    }

    return reloadParams
  }
</script>

{#if always || !loaded}
  <svelte:element this={as} bind:this={el} />
{/if}

{#if loaded}
  <slot {fetching} />
{:else if $$slots.fallback}
  <slot name="fallback" />
{/if}
