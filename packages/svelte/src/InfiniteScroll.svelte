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

  export let data: InfiniteScrollComponentBaseProps['data'] = undefined
  export let buffer: InfiniteScrollComponentBaseProps['buffer'] = 0
  export let as: InfiniteScrollComponentBaseProps['as'] = 'div'
  export let manual: InfiniteScrollComponentBaseProps['manual'] = false
  export let manualAfter: InfiniteScrollComponentBaseProps['manualAfter'] = 0
  export let preserveUrl: InfiniteScrollComponentBaseProps['preserveUrl'] = false
  export let reverse: InfiniteScrollComponentBaseProps['reverse'] = false
  export let autoScroll: InfiniteScrollComponentBaseProps['autoScroll'] = undefined
  export let startElement: string | (() => HTMLElement | null | undefined) = undefined
  export let endElement: string | (() => HTMLElement | null | undefined) = undefined
  export let itemsElement: string | (() => HTMLElement | null | undefined) = undefined
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
  $: manualMode = manual || (manualAfter > 0 && requestCount >= manualAfter)
  $: autoLoad = !manualMode

  $: trigger = (() => {
    if (onlyNext && !onlyPrevious) {
      return 'end'
    }

    if (onlyPrevious && !onlyNext) {
      return 'start'
    }

    return 'both'
  })()

  $: headerAutoMode = autoLoad && trigger !== 'end'
  $: footerAutoMode = autoLoad && trigger !== 'start'

  $: sharedExposed = {
    loadingPrevious,
    loadingNext,
    hasPrevious: infiniteScrollInstance?.dataManager.hasPrevious() || false,
    hasNext: infiniteScrollInstance?.dataManager.hasNext() || false,
  } satisfies Pick<InfiniteScrollActionSlotProps, 'loadingPrevious' | 'loadingNext' | 'hasPrevious' | 'hasNext'>

  $: exposedPrevious = {
    loading: loadingPrevious,
    fetch: loadPrevious,
    autoMode: headerAutoMode,
    manualMode: !headerAutoMode,
    hasMore: infiniteScrollInstance?.dataManager.hasPrevious() || false,
    ...sharedExposed,
  } satisfies InfiniteScrollActionSlotProps

  $: exposedNext = {
    loading: loadingNext,
    fetch: loadNext,
    autoMode: footerAutoMode,
    manualMode: !footerAutoMode,
    hasMore: infiniteScrollInstance?.dataManager.hasNext() || false,
    ...sharedExposed,
  } satisfies InfiniteScrollActionSlotProps

  $: exposedSlot = {
    loading: loadingPrevious || loadingNext,
    loadingPrevious,
    loadingNext,
  } satisfies InfiniteScrollSlotProps

  let infiniteScrollInstance: UseInfiniteScrollProps | null = null

  function resolveHTMLElement(
    value: string | (() => HTMLElement | null | undefined) | undefined,
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

  export function loadPrevious(options?: any) {
    infiniteScrollInstance?.dataManager.loadPrevious(options)
  }

  export function loadNext(options?: any) {
    infiniteScrollInstance?.dataManager.loadNext(options)
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
      inReverseMode: () => reverse,
      shouldPreserveUrl: () => preserveUrl,

      // Elements
      getTrigger: () => trigger,
      getTriggerMargin: () => buffer,
      getStartElement: () => resolvedStartElement,
      getEndElement: () => resolvedEndElement,
      getItemsElement: () => resolvedItemsElement,
      getScrollableParent: () => (resolvedItemsElement ? getScrollableParent(resolvedItemsElement) : null),

      // Request callbacks
      onBeforePreviousRequest: () => (loadingPrevious = true),
      onBeforeNextRequest: () => (loadingNext = true),
      onCompletePreviousRequest: () => {
        requestCount += 1
        loadingPrevious = false
      },
      onCompleteNextRequest: () => {
        requestCount += 1
        loadingNext = false
      },
    })

    const { dataManager, elementManager } = infiniteScrollInstance

    elementManager.setupObservers()
    elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

    // autoScroll defaults to reverse value if not explicitly set
    const shouldAutoScroll = autoScroll !== undefined ? autoScroll : reverse

    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }

  $: {
    // Make this block run whenever these change
    ;[autoLoad, trigger, reverse]

    autoLoad
      ? infiniteScrollInstance?.elementManager.enableTriggers()
      : infiniteScrollInstance?.elementManager.disableTriggers()
  }

  onDestroy(() => infiniteScrollInstance?.elementManager.flushAll())
</script>

{#if !startElement && !reverse}
  <div bind:this={startElementRef}>
    <slot name="previous" {exposedPrevious}>
      {#if loadingPrevious}
        <slot name="loading" {exposedPrevious} />
      {/if}
    </slot>
  </div>
{/if}

{#if !endElement && reverse}
  <div bind:this={endElementRef}>
    <slot name="next" {exposedNext}>
      {#if loadingNext}
        <slot name="loading" {exposedNext} />
      {/if}
    </slot>
  </div>
{/if}

<svelte:element this={as} bind:this={itemsElementRef} {...$$restProps}>
  <slot {exposedSlot} />
</svelte:element>

{#if !startElement && reverse}
  <div bind:this={startElementRef}>
    <slot name="previous" {exposedPrevious}>
      {#if loadingPrevious}
        <slot name="loading" {exposedPrevious} />
      {/if}
    </slot>
  </div>
{/if}

{#if !endElement && !reverse}
  <div bind:this={endElementRef}>
    <slot name="next" {exposedNext}>
      {#if loadingNext}
        <slot name="loading" {exposedNext} />
      {/if}
    </slot>
  </div>
{/if}
