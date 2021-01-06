<template>
  <div>
    <span class="text">This is the links page that demonstrates scroll preservation</span>
    <div style="width: 200vw; height: 200vh; margin-top: 50vh">
      <div class="document-position">Document scroll position is {{ documentScrollLeft }} & {{ documentScrollTop }}</div>
      <span class="foo">Foo is now {{ foo }}</span>
      <inertia-link href="/links/preserve-scroll-page-two" :data="{ foo: 'bar' }" class="default">Reset Scroll</inertia-link>
      <inertia-link href="/links/preserve-scroll-page-two" preserve-scroll :data="{ foo: 'baz' }" class="preserve">Preserve Scroll</inertia-link>

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
    }
  }
}
</script>
