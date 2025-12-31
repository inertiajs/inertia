<script lang="ts">
  import {
    getScrollableParent,
    type InfiniteScrollActionSlotProps,
    type InfiniteScrollComponentBaseProps,
    type UseInfiniteScrollProps,
    type InfiniteScrollSlotProps,
    useInfiniteScroll,
  } from '@inertiajs/core'
  import { onDestroy, onMount } from 'svelte'
  import page from '../page'

  export let data: InfiniteScrollComponentBaseProps['data']
  export let buffer: InfiniteScrollComponentBaseProps['buffer'] = 0
  export let as: InfiniteScrollComponentBaseProps['as'] = 'div'
  export let manual: InfiniteScrollComponentBaseProps['manual'] = false
  export let manualAfter: InfiniteScrollComponentBaseProps['manualAfter'] = 0
  export let preserveUrl: InfiniteScrollComponentBaseProps['preserveUrl'] = false
  export let reverse: InfiniteScrollComponentBaseProps['reverse'] = false
  export let autoScroll: InfiniteScrollComponentBaseProps['autoScroll'] = undefined
  export let startElement: string | (() => HTMLElement | null) | null = null
  export let endElement: string | (() => HTMLElement | null) | null = null
  export let itemsElement: string | (() => HTMLElement | null) | null = null
  export let onlyNext = false
  export let onlyPrevious = false

  let itemsElementRef: HTMLElement
  let startElementRef: HTMLElement
  let endElementRef: HTMLElement
  let loadingPrevious = false
  let loadingNext = false
  let requestCount = 0

  $: resolvedItemsElement = resolveHTMLElement(itemsElement, itemsElementRef)
  $: scrollableParent = resolvedItemsElement ? getScrollableParent(resolvedItemsElement) : null

  $: dataProp = $page?.props?.[data]

  $: sharedExposed = {
    loadingPrevious,
    loadingNext,
    hasPrevious: (void dataProp, infiniteScrollInstance?.dataManager.hasPrevious()) || false,
    hasNext: (void dataProp, infiniteScrollInstance?.dataManager.hasNext()) || false,
  } satisfies Pick<InfiniteScrollActionSlotProps, 'loadingPrevious' | 'loadingNext' | 'hasPrevious' | 'hasNext'>

  $: exposedPrevious = {
    loading: loadingPrevious,
    fetch: fetchPrevious,
    autoMode: headerAutoMode,
    manualMode: !headerAutoMode,
    hasMore: (void dataProp, infiniteScrollInstance?.dataManager.hasPrevious()) || false,
    ...sharedExposed,
  } satisfies InfiniteScrollActionSlotProps

  $: exposedNext = {
    loading: loadingNext,
    fetch: fetchNext,
    autoMode: footerAutoMode,
    manualMode: !footerAutoMode,
    hasMore: (void dataProp, infiniteScrollInstance?.dataManager.hasNext()) || false,
    ...sharedExposed,
  } satisfies InfiniteScrollActionSlotProps

  $: exposedSlot = {
    loading: loadingPrevious || loadingNext,
    loadingPrevious,
    loadingNext,
  } satisfies InfiniteScrollSlotProps

  let infiniteScrollInstance: UseInfiniteScrollProps | null = null

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
        requestCount = infiniteScrollInstance!.dataManager.getRequestCount()
        loadingPrevious = false
      },
      onCompleteNextRequest: () => {
        requestCount = infiniteScrollInstance!.dataManager.getRequestCount()
        loadingNext = false
      },
    })

    const { dataManager, elementManager } = infiniteScrollInstance

    requestCount = dataManager.getRequestCount()

    elementManager.setupObservers()
    elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

    // autoScroll defaults to reverse value if not explicitly set
    const shouldAutoScroll = autoScroll !== undefined ? autoScroll : reverse

    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }

  $: manualMode = manual || (manualAfter !== undefined && manualAfter > 0 && requestCount >= manualAfter)
  $: autoLoad = !manualMode

  $: headerAutoMode = autoLoad && !onlyNext
  $: footerAutoMode = autoLoad && !onlyPrevious

  $: {
    // Make this block run whenever these change
    ;[autoLoad, onlyNext, onlyPrevious, reverse]

    autoLoad
      ? infiniteScrollInstance?.elementManager.enableTriggers()
      : infiniteScrollInstance?.elementManager.disableTriggers()
  }

  onDestroy(() => infiniteScrollInstance?.flush())
</script>

{#if !startElement && !reverse}
  <div bind:this={startElementRef}>
    <slot name="previous" {exposedPrevious} {...exposedPrevious}>
      {#if loadingPrevious}
        <slot name="loading" {exposedPrevious} {...exposedPrevious} />
      {/if}
    </slot>
  </div>
{/if}

{#if !endElement && reverse}
  <div bind:this={endElementRef}>
    <slot name="next" {exposedNext} {...exposedNext}>
      {#if loadingNext}
        <slot name="loading" {exposedNext} {...exposedNext} />
      {/if}
    </slot>
  </div>
{/if}

<svelte:element this={as} bind:this={itemsElementRef} {...$$restProps}>
  <slot {exposedSlot} {...exposedSlot} />
</svelte:element>

{#if !startElement && reverse}
  <div bind:this={startElementRef}>
    <slot name="previous" {exposedPrevious} {...exposedPrevious}>
      {#if loadingPrevious}
        <slot name="loading" {exposedPrevious} {...exposedPrevious} />
      {/if}
    </slot>
  </div>
{/if}

{#if !endElement && !reverse}
  <div bind:this={endElementRef}>
    <slot name="next" {exposedNext} {...exposedNext}>
      {#if loadingNext}
        <slot name="loading" {exposedNext} {...exposedNext} />
      {/if}
    </slot>
  </div>
{/if}
