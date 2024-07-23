<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const documentScrollTop = ref(0)
const documentScrollLeft = ref(0)
const slotScrollTop = ref(0)
const slotScrollLeft = ref(0)

const handleScrollEvent = () => {
  documentScrollTop.value = document.documentElement.scrollTop
  documentScrollLeft.value = document.documentElement.scrollLeft
  slotScrollTop.value = document.getElementById('slot').scrollTop
  slotScrollLeft.value = document.getElementById('slot').scrollLeft
}

onMounted(() => {
  document.addEventListener('scroll', handleScrollEvent)
})

onUnmounted(() => {
  document.removeEventListener('scroll', handleScrollEvent)
})
</script>

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
