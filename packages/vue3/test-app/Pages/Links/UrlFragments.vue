<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

const documentScrollTop = ref(0)
const documentScrollLeft = ref(0)

onMounted(() => {
  document.addEventListener('scroll', handleScrollEvent)
})

const handleScrollEvent = () => {
  documentScrollTop.value = document.documentElement.scrollTop
  documentScrollLeft.value = document.documentElement.scrollLeft
}
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates url fragment behaviour</span>
    <div style="width: 200vw; height: 200vh; margin-top: 50vh">
      <button @click="handleScrollEvent">Update scroll positions</button>
      <!-- prettier-ignore -->
      <div class="document-position">Document scroll position is {{ documentScrollLeft }} & {{ documentScrollTop }}</div>
      <Link href="/links/url-fragments#target" class="basic">Basic link</Link>
      <Link href="#target" class="fragment">Fragment link</Link>
      <Link href="/links/url-fragments#non-existent-fragment" class="non-existent-fragment"
        >Non-existent fragment link</Link
      >

      <div id="target">This is the element with id 'target'</div>
    </div>
  </div>
</template>
