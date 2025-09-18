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
  export let trigger: InfiniteScrollComponentBaseProps['trigger'] = 'both'
  export let as: InfiniteScrollComponentBaseProps['as'] = 'div'
  export let manual: InfiniteScrollComponentBaseProps['manual'] = false
  export let manualAfter: InfiniteScrollComponentBaseProps['manualAfter'] = 0
  export let preserveUrl: InfiniteScrollComponentBaseProps['preserveUrl'] = false
  export let reverse: InfiniteScrollComponentBaseProps['reverse'] = false
  export let autoScroll: InfiniteScrollComponentBaseProps['autoScroll'] = undefined
  export let beforeElement: string | (() => HTMLElement | null | undefined) = undefined
  export let afterElement: string | (() => HTMLElement | null | undefined) = undefined
  export let slotElement: string | (() => HTMLElement | null | undefined) = undefined

  let slotElementRef: HTMLElement
  let beforeElementRef: HTMLElement
  let afterElementRef: HTMLElement
  let loadingBefore = false
  let loadingAfter = false
  let requestCount = 0

  $: resolvedSlotElement = resolveHTMLElement(slotElement, slotElementRef)
  $: scrollableParent = resolvedSlotElement ? getScrollableParent(resolvedSlotElement) : null
  $: manualMode = manual || (manualAfter > 0 && requestCount >= manualAfter)
  $: autoLoad = !manualMode

  $: headerAutoMode = autoLoad && trigger !== 'end'
  $: footerAutoMode = autoLoad && trigger !== 'start'

  $: exposedBefore: InfiniteScrollActionSlotProps = {
    loading: loadingBefore,
    loadingBefore,
    loadingAfter,
    fetch: loadBefore,
    autoMode: headerAutoMode,
    manualMode: !headerAutoMode,
    hasMore: infiniteScrollInstance?.dataManager.hasMoreBefore() || false,
  }

  $: exposedAfter: InfiniteScrollActionSlotProps = {
    loading: loadingAfter,
    loadingBefore,
    loadingAfter,
    fetch: loadAfter,
    autoMode: footerAutoMode,
    manualMode: !footerAutoMode,
    hasMore: infiniteScrollInstance?.dataManager.hasMoreAfter() || false,
  }

  $: exposedSlot: InfiniteScrollSlotProps = {
    loading: loadingBefore || loadingAfter,
    loadingBefore,
    loadingAfter,
  }

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

  export function loadBefore(options?: any) {
    infiniteScrollInstance?.dataManager.loadBefore(options)
  }

  export function loadAfter(options?: any) {
    infiniteScrollInstance?.dataManager.loadAfter(options)
  }

  export function hasMoreBefore(): boolean {
    return infiniteScrollInstance?.dataManager.hasMoreBefore() || false
  }

  export function hasMoreAfter(): boolean {
    return infiniteScrollInstance?.dataManager.hasMoreAfter() || false
  }

  onMount(() => {
    setTimeout(setupInfiniteScrollInstance)
  })

  function setupInfiniteScrollInstance() {
    const resolvedSlotElement = resolveHTMLElement(slotElement, slotElementRef)
    const resolvedBeforeElement = resolveHTMLElement(beforeElement, beforeElementRef)
    const resolvedAfterElement = resolveHTMLElement(afterElement, afterElementRef)

    infiniteScrollInstance = useInfiniteScroll({
      // Data
      getPropName: () => data,
      inReverseMode: () => reverse,
      shouldPreserveUrl: () => preserveUrl,

      // Elements
      getTrigger: () => trigger,
      getTriggerMargin: () => buffer,
      getBeforeElement: () => resolvedBeforeElement,
      getAfterElement: () => resolvedAfterElement,
      getSlotElement: () => resolvedSlotElement,
      getScrollableParent: () => (resolvedSlotElement ? getScrollableParent(resolvedSlotElement) : null),

      // Request callbacks
      onRequestStart: (side) => {
        if (side === 'before') {
          loadingBefore = true
        } else {
          loadingAfter = true
        }
      },
      onRequestComplete: (side) => {
        requestCount += 1

        if (side === 'before') {
          loadingBefore = false
        } else {
          loadingAfter = false
        }
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
  [autoLoad, trigger, reverse];

  autoLoad
    ? infiniteScrollInstance?.elementManager.enableTriggers();
    : infiniteScrollInstance?.elementManager.disableTriggers();
}

  onDestroy(() => infiniteScrollInstance?.elementManager.flushAll())
</script>

{#if !beforeElement}
  <div bind:this={beforeElementRef}>
    <slot name="before" {exposedBefore}>
      {#if loadingBefore}
        <slot name="loading" {exposedBefore} />
      {/if}
    </slot>
  </div>
{/if}

<svelte:element this={as} bind:this={slotElementRef} {...$$restProps}>
  <slot {exposedSlot} />
</svelte:element>

{#if !afterElement}
  <div bind:this={afterElementRef}>
    <slot name="after" {exposedAfter}>
      {#if loadingAfter}
        <slot name="loading" {exposedAfter} />
      {/if}
    </slot>
  </div>
{/if}
