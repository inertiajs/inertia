<template>
  <div>
    <span class="text">This is the links page that demonstrates scroll preservation</span>
    <div style="width: 200vw; height: 200vh; margin-top: 50vh">
      <div class="document-position">Document scroll position is {{ documentScrollLeft }} & {{ documentScrollTop }}</div>
      <span class="foo">Foo is now {{ foo }}</span>

      <span @click="preserve" class="preserve">Preserve Scroll</span>
      <span @click="preserveFalse" class="reset">Reset Scroll</span>
      <span @click="preserveGet" class="preserve-get">Preserve Scroll (GET)</span>
      <span @click="preserveGetFalse" class="reset-get">Reset Scroll (GET)</span>

      <div class="area1-position">Area 1 scroll position is {{ areaOneScrollLeft }} & {{ areaOneScrollTop }}</div>
      <div id="area1" style="overflow: scroll; background-color: #FF0000; width: 100px; height: 100px;" @scroll="handleScrollEvent">
        <div style="padding: 200px;">Test</div>
      </div>

      <div class="area2-position">Area 2 scroll position is {{ areaTwoScrollLeft }} & {{ areaTwoScrollTop }}</div>
      <div id="area2" scroll-region style="overflow: scroll; background-color: #00FF00; width: 100px; height: 100px;" @scroll="handleScrollEvent">
        <div style="padding: 200px;">Test</div>
      </div>

      <a href="/non-inertia" class="off-site">Off-site link</a>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    foo: {
      type: String,
      default: 'default',
    },
  },
  data: () => ({
    documentScrollTop: 0,
    documentScrollLeft: 0,
    areaOneScrollTop: 0,
    areaOneScrollLeft: 0,
    areaTwoScrollTop: 0,
    areaTwoScrollLeft: 0,
  }),
  created() {
    document.addEventListener('scroll', this.handleScrollEvent)
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.handleScrollEvent)
  },
  methods: {
    handleScrollEvent() {
      this.documentScrollTop = document.documentElement.scrollTop;
      this.documentScrollLeft = document.documentElement.scrollLeft;
      this.areaOneScrollTop = document.getElementById('area1').scrollTop;
      this.areaOneScrollLeft = document.getElementById('area1').scrollLeft;
      this.areaTwoScrollTop = document.getElementById('area2').scrollTop;
      this.areaTwoScrollLeft = document.getElementById('area2').scrollLeft;
    },
    preserve() {
      this.$inertia.visit('/visits/preserve-scroll-page-two', {
        data: { foo: 'baz' },
        preserveScroll: true
      })
    },
    preserveFalse() {
      this.$inertia.visit('/visits/preserve-scroll-page-two', {
        data: { foo: 'bar' }
      })
    },
    preserveGet() {
      this.$inertia.get('/visits/preserve-scroll-page-two', {
        foo: 'bar',
        preserveScroll: true
      })
    },
    preserveGetFalse() {
      this.$inertia.get('/visits/preserve-scroll-page-two', {
        foo: 'bar'
      })
    },
  }
}
</script>
