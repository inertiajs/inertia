<script>
  let slot
  let documentScrollTop = 0
  let documentScrollLeft = 0
  let slotScrollTop = 0
  let slotScrollLeft = 0

  const handleScrollEvent = () => {
    documentScrollTop = document.documentElement.scrollTop
    documentScrollLeft = document.documentElement.scrollLeft
    slotScrollTop = slot.scrollTop
    slotScrollLeft = slot.scrollLeft
  }
</script>

<svelte:document on:scroll={handleScrollEvent} />

<div style="width: 200vw">
  <span class="layout-text">Without scroll regions</span>
  <div class="document-position">Document scroll position is {documentScrollLeft} & {documentScrollTop}</div>
  <div style="height: 200vh">
    <span class="slot-position">Slot scroll position is {slotScrollLeft} & {slotScrollTop}</span>
    <div bind:this={slot} id="slot" style="height: 100px; width: 500px; overflow: scroll" on:scroll={handleScrollEvent}>
      <slot />
    </div>
  </div>
</div>
