<script lang="ts">
  import {
    getScrollableParent,
    type InfiniteScrollActionSlotProps,
    type InfiniteScrollComponentBaseProps,
    type UseInfiniteScrollProps,
    type InfiniteScrollSlotProps,
    type ReloadOptions,
    useInfiniteScroll,
  } from '@inertiajs/core'
  import { onDestroy, onMount } from 'svelte'

  interface Props {
    data: InfiniteScrollComponentBaseProps['data']
    buffer?: InfiniteScrollComponentBaseProps['buffer']
    as?: InfiniteScrollComponentBaseProps['as']
    manual?: InfiniteScrollComponentBaseProps['manual']
    manualAfter?: InfiniteScrollComponentBaseProps['manualAfter']
    preserveUrl?: InfiniteScrollComponentBaseProps['preserveUrl']
    reverse?: InfiniteScrollComponentBaseProps['reverse']
    autoScroll?: InfiniteScrollComponentBaseProps['autoScroll']
    startElement?: string | (() => HTMLElement | null) | null
    endElement?: string | (() => HTMLElement | null) | null
    itemsElement?: string | (() => HTMLElement | null) | null
    params?: ReloadOptions
    onlyNext?: boolean
    onlyPrevious?: boolean
    previous?: import('svelte').Snippet<[any]>
    loading?: import('svelte').Snippet<[any]>
    next?: import('svelte').Snippet<[any]>
    children?: import('svelte').Snippet<[any]>
    [key: string]: any
  }

  let {
    data,
    buffer = 0,
    as = 'div',
    manual = false,
    manualAfter = 0,
    preserveUrl = false,
    reverse = false,
    autoScroll = undefined,
    startElement = null,
    endElement = null,
    itemsElement = null,
    params = {},
    onlyNext = false,
    onlyPrevious = false,
    previous,
    loading,
    next,
    children,
    ...rest
  }: Props = $props()

  let itemsElementRef: HTMLElement = $state(null!)
  let startElementRef: HTMLElement = $state(null!)
  let endElementRef: HTMLElement = $state(null!)
  let loadingPrevious = $state(false)
  let loadingNext = $state(false)
  let requestCount = $state(0)
  let hasPreviousPage = $state(false)
  let hasNextPage = $state(false)

  let infiniteScrollInstance: UseInfiniteScrollProps = $state(null!)

  function resolveHTMLElement(
    value: string | (() => HTMLElement | null) | null,
    fallback: HTMLElement | null,
  ): HTMLElement | null {
    if (!value) {
      return fallback
    }

    if (typeof value === 'string') {
      return document.querySelector(value) as HTMLElement | null
    }

    if (typeof value === 'function') {
      return value() || null
    }

    return fallback
  }

  function scrollToBottom() {
    if (scrollableParent) {
      scrollableParent.scrollTo({
        top: scrollableParent.scrollHeight,
        behavior: 'instant',
      })
    } else {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'instant',
      })
    }
  }

  export function fetchPrevious(options?: any) {
    infiniteScrollInstance?.dataManager.fetchPrevious(options)
  }

  export function fetchNext(options?: any) {
    infiniteScrollInstance?.dataManager.fetchNext(options)
  }

  export function hasPrevious(): boolean {
    return infiniteScrollInstance?.dataManager.hasPrevious() || false
  }

  export function hasNext(): boolean {
    return infiniteScrollInstance?.dataManager.hasNext() || false
  }

  onMount(() => {
    setTimeout(setupInfiniteScrollInstance)
  })

  function syncStateFromDataManager() {
    requestCount = infiniteScrollInstance!.dataManager.getRequestCount()
    hasPreviousPage = infiniteScrollInstance!.dataManager.hasPrevious()
    hasNextPage = infiniteScrollInstance!.dataManager.hasNext()
  }

  function setupInfiniteScrollInstance() {
    const resolvedItemsElement = resolveHTMLElement(itemsElement, itemsElementRef)
    const resolvedStartElement = resolveHTMLElement(startElement, startElementRef)
    const resolvedEndElement = resolveHTMLElement(endElement, endElementRef)

    infiniteScrollInstance = useInfiniteScroll({
      // Data
      getPropName: () => data,
      inReverseMode: () => reverse ?? false,
      shouldFetchNext: () => !onlyPrevious,
      shouldFetchPrevious: () => !onlyNext,
      shouldPreserveUrl: () => preserveUrl ?? false,
      getReloadOptions: () => params,

      // Elements
      getTriggerMargin: () => buffer ?? 0,
      getStartElement: () => resolvedStartElement!,
      getEndElement: () => resolvedEndElement!,
      getItemsElement: () => resolvedItemsElement!,
      getScrollableParent: () => (resolvedItemsElement ? getScrollableParent(resolvedItemsElement) : null),

      // Request callbacks
      onBeforePreviousRequest: () => (loadingPrevious = true),
      onBeforeNextRequest: () => (loadingNext = true),
      onCompletePreviousRequest: () => {
        loadingPrevious = false
        syncStateFromDataManager()
      },
      onCompleteNextRequest: () => {
        loadingNext = false
        syncStateFromDataManager()
      },
      onDataReset: syncStateFromDataManager,
    })

    const { dataManager, elementManager } = infiniteScrollInstance

    syncStateFromDataManager()

    elementManager.setupObservers()
    elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

    // autoScroll defaults to reverse value if not explicitly set
    const shouldAutoScroll = autoScroll !== undefined ? autoScroll : reverse

    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }

  onDestroy(() => infiniteScrollInstance?.flush())
  let resolvedItemsElement = $derived(resolveHTMLElement(itemsElement, itemsElementRef))
  let scrollableParent = $derived(resolvedItemsElement ? getScrollableParent(resolvedItemsElement) : null)
  let sharedExposed = $derived({
    loadingPrevious,
    loadingNext,
    hasPrevious: hasPreviousPage,
    hasNext: hasNextPage,
  } satisfies Pick<InfiniteScrollActionSlotProps, 'loadingPrevious' | 'loadingNext' | 'hasPrevious' | 'hasNext'>)
  let manualMode = $derived(manual || (manualAfter !== undefined && manualAfter > 0 && requestCount >= manualAfter))
  let autoLoad = $derived(!manualMode)
  let headerAutoMode = $derived(autoLoad && !onlyNext)
  let exposedPrevious = $derived({
    loading: loadingPrevious,
    fetch: fetchPrevious,
    autoMode: headerAutoMode,
    manualMode: !headerAutoMode,
    hasMore: hasPreviousPage,
    ...sharedExposed,
  } satisfies InfiniteScrollActionSlotProps)
  let footerAutoMode = $derived(autoLoad && !onlyPrevious)
  let exposedNext = $derived({
    loading: loadingNext,
    fetch: fetchNext,
    autoMode: footerAutoMode,
    manualMode: !footerAutoMode,
    hasMore: hasNextPage,
    ...sharedExposed,
  } satisfies InfiniteScrollActionSlotProps)
  let exposedSlot = $derived({
    loading: loadingPrevious || loadingNext,
    loadingPrevious,
    loadingNext,
  } satisfies InfiniteScrollSlotProps)
  $effect(() => {
    // Make this block run whenever these change
    ;[autoLoad, onlyNext, onlyPrevious, reverse]

    autoLoad
      ? infiniteScrollInstance?.elementManager.enableTriggers()
      : infiniteScrollInstance?.elementManager.disableTriggers()
  })
</script>

{#if !startElement && !reverse}
  <div bind:this={startElementRef}>
    {#if previous}{@render previous({ exposedPrevious, ...exposedPrevious })}{:else if loadingPrevious}
      {@render loading?.({ exposedPrevious, ...exposedPrevious })}
    {/if}
  </div>
{/if}

{#if !endElement && reverse}
  <div bind:this={endElementRef}>
    {#if next}{@render next({ exposedNext, ...exposedNext })}{:else if loadingNext}
      {@render loading?.({ exposedNext, ...exposedNext })}
    {/if}
  </div>
{/if}

<svelte:element this={as} bind:this={itemsElementRef} {...rest}>
  {@render children?.({ exposedSlot, ...exposedSlot })}
</svelte:element>

{#if !startElement && reverse}
  <div bind:this={startElementRef}>
    {#if previous}{@render previous({ exposedPrevious, ...exposedPrevious })}{:else if loadingPrevious}
      {@render loading?.({ exposedPrevious, ...exposedPrevious })}
    {/if}
  </div>
{/if}

{#if !endElement && !reverse}
  <div bind:this={endElementRef}>
    {#if next}{@render next({ exposedNext, ...exposedNext })}{:else if loadingNext}
      {@render loading?.({ exposedNext, ...exposedNext })}
    {/if}
  </div>
{/if}
