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
<script>
export default {
  data: () => ({
    documentScrollTop: 0,
    documentScrollLeft: 0,
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
    },
    basicVisit() {
      this.$inertia.visit('/visits/url-fragments#target')
    },
    fragmentVisit() {
      this.$inertia.visit('#target')
    },
    nonExistentFragmentVisit() {
      this.$inertia.visit('/visits/url-fragments#non-existent-fragment')
    },
    basicGetVisit() {
      this.$inertia.get('/visits/url-fragments#target')
    },
    fragmentGetVisit() {
      this.$inertia.get('#target')
    },
    nonExistentFragmentGetVisit() {
      this.$inertia.get('/visits/url-fragments#non-existent-fragment')
    },
  },
}
</script>
