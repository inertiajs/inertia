<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
  let slot: HTMLDivElement = $state(null!)
  let documentScrollTop = $state(0)
  let documentScrollLeft = $state(0)
  let slotScrollTop = $state(0)
  let slotScrollLeft = $state(0)

  const handleScrollEvent = () => {
    documentScrollTop = document.documentElement.scrollTop
    documentScrollLeft = document.documentElement.scrollLeft
    slotScrollTop = slot.scrollTop
    slotScrollLeft = slot.scrollLeft
  }
</script>

<svelte:document onscroll={handleScrollEvent} />

<div style="width: 200vw">
  <span class="layout-text">With scroll regions</span>
  <button onclick={handleScrollEvent}>Update scroll positions</button>
  <div class="document-position">Document scroll position is {documentScrollLeft} & {documentScrollTop}</div>
  <div style="height: 200vh">
    <span class="slot-position">Slot scroll position is {slotScrollLeft} & {slotScrollTop}</span>
    <div
      bind:this={slot}
      id="slot"
      scroll-region
      style="height: 100px; width: 500px; overflow: scroll"
      onscroll={handleScrollEvent}
    >
      {@render children?.()}
    </div>
  </div>
</div>
