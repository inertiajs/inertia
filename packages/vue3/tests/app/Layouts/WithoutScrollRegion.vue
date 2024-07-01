<template>
  <div style="width: 200vw">
    <span class="layout-text">Without scroll regions</span>
    <div class="document-position">Document scroll position is {{ documentScrollLeft }} & {{ documentScrollTop }}</div>
    <div style="height: 200vh">
      <span class="slot-position">Slot scroll position is {{ slotScrollLeft }} & {{ slotScrollTop }}</span>
      <div id="slot" style="height: 100px; width: 500px; overflow: scroll" @scroll="handleScrollEvent">
        <slot />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    documentScrollTop: 0,
    documentScrollLeft: 0,
    slotScrollTop: 0,
    slotScrollLeft: 0,
  }),
  created() {
    document.addEventListener('scroll', this.handleScrollEvent)
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.handleScrollEvent)
  },
  methods: {
    handleScrollEvent() {
      this.documentScrollTop = document.documentElement.scrollTop
      this.documentScrollLeft = document.documentElement.scrollLeft
      this.slotScrollTop = document.getElementById('slot').scrollTop
      this.slotScrollLeft = document.getElementById('slot').scrollLeft
    },
  },
}
</script>
