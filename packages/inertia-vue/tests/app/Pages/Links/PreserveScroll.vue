<template>
  <div style="width: 200vw; height: 200vh; margin-top: 50vh">
    <div class="text">Document scroll position is {{ windowScrollLeft }} & {{ windowScrollTop }}</div>
    <span class="foo">Foo is now {{ foo }}</span>
    <inertia-link href="/links/preserve-scroll-page-two" :data="{ foo: 'bar' }" class="default">Reset Scroll</inertia-link>
    <inertia-link href="/links/preserve-scroll-page-two" preserve-scroll :data="{ foo: 'baz' }" class="preserve">Preserve Scroll</inertia-link>

    <div class="area1-text">Area 1 scroll position is {{ areaOneScrollLeft }} & {{ areaOneScrollTop }}</div>
    <div id="area1" style="overflow: scroll; background-color: #FF0000; width: 100px; height: 100px;" @scroll="handleScrollEvent">
      <div style="padding: 200px;">Test</div>
    </div>

    <div class="area2-text">Area 2 scroll position is {{ areaTwoScrollLeft }} & {{ areaTwoScrollTop }}</div>
    <div id="area2" scroll-region style="overflow: scroll; background-color: #00FF00; width: 100px; height: 100px;" @scroll="handleScrollEvent">
      <div style="padding: 200px;">Test</div>
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
    windowScrollTop: 0,
    windowScrollLeft: 0,
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
      this.windowScrollTop = document.documentElement.scrollTop;
      this.windowScrollLeft = document.documentElement.scrollLeft;
      this.areaOneScrollTop = document.getElementById('area1').scrollTop;
      this.areaOneScrollLeft = document.getElementById('area1').scrollLeft;
      this.areaTwoScrollTop = document.getElementById('area2').scrollTop;
      this.areaTwoScrollLeft = document.getElementById('area2').scrollLeft;
    }
  }
}
</script>
