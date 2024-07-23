<script setup>
import { router } from '@inertiajs/vue3'
import { onBeforeUnmount, onMounted } from 'vue'

const documentScrollTop = ref(0)
const documentScrollLeft = ref(0)

onMounted(() => {
  document.addEventListener('scroll', handleScrollEvent)
})

onBeforeUnmount(() => {
  document.removeEventListener('scroll', handleScrollEvent)
})

const handleScrollEvent = () => {
  documentScrollTop.value = document.documentElement.scrollTop
  documentScrollLeft.value = document.documentElement.scrollLeft
}

const basicVisit = () => {
  router.visit('/visits/url-fragments#target')
}

const fragmentVisit = () => {
  router.visit('#target')
}

const nonExistentFragmentVisit = () => {
  router.visit('/visits/url-fragments#non-existent-fragment')
}

const basicGetVisit = () => {
  router.get('/visits/url-fragments#target')
}

const fragmentGetVisit = () => {
  router.get('#target')
}

const nonExistentFragmentGetVisit = () => {
  router.get('/visits/url-fragments#non-existent-fragment')
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates url fragment behaviour using manual visits</span>
    <div style="width: 200vw; height: 200vh; margin-top: 50vh">
      <!-- prettier-ignore -->
      <div class="document-position">Document scroll position is {{ documentScrollLeft }} & {{ documentScrollTop }}</div>
      <span @click="basicVisit" class="basic">Basic visit</span>
      <span @click="fragmentVisit" class="fragment">Fragment visit</span>
      <span @click="nonExistentFragmentVisit" class="non-existent-fragment">Non-existent fragment visit</span>

      <span @click="basicGetVisit" class="basic-get">Basic GET visit</span>
      <span @click="fragmentGetVisit" class="fragment-get">Fragment GET visit</span>
      <span @click="nonExistentFragmentGetVisit" class="non-existent-fragment-get">Non-existent fragment visit</span>

      <div id="target">This is the element with id 'target'</div>
    </div>
  </div>
</template>
