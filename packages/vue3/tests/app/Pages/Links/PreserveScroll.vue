<template>
  <div style="height: 800px; width: 600px">
    <span class="text">This is the links page that demonstrates scroll preservation with scroll regions</span>
    <span class="foo">Foo is now {{ foo }}</span>

    <inertia-link href="/links/preserve-scroll-page-two" preserve-scroll :data="{ foo: 'baz' }" class="preserve"
      >Preserve Scroll</inertia-link
    >
    <inertia-link href="/links/preserve-scroll-page-two" :data="{ foo: 'bar' }" class="reset"
      >Reset Scroll</inertia-link
    >

    <inertia-link
      href="/links/preserve-scroll-page-two"
      :preserve-scroll="preserveCallback"
      :data="{ foo: 'baz' }"
      class="preserve-callback"
      >Preserve Scroll (Callback)</inertia-link
    >
    <inertia-link
      href="/links/preserve-scroll-page-two"
      :preserve-scroll="preserveCallbackFalse"
      :data="{ foo: 'foo' }"
      class="reset-callback"
      >Reset Scroll (Callback)</inertia-link
    >

    <a href="/non-inertia" class="off-site">Off-site link</a>
  </div>
</template>
<script>
import WithScrollRegion from '@/Layouts/WithScrollRegion.vue'

export default {
  layout: WithScrollRegion,
  props: {
    foo: {
      type: String,
      default: 'default',
    },
  },
  methods: {
    preserveCallback(page) {
      alert(page)

      return true
    },
    preserveCallbackFalse(page) {
      alert(page)

      return false
    },
  },
}
</script>
