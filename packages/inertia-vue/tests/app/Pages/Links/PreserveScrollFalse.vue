<template>
  <div style="height: 800px; width: 600px;">
    <span class="text">This is the links page that demonstrates scroll preservation without scroll regions</span>
    <span class="foo">Foo is now {{ foo }}</span>

    <inertia-link href="/links/preserve-scroll-false-page-two" preserve-scroll :data="{ foo: 'baz' }" class="preserve">Preserve Scroll</inertia-link>
    <inertia-link href="/links/preserve-scroll-false-page-two" :data="{ foo: 'bar' }" class="reset">Reset Scroll</inertia-link>

    <a href="/non-inertia" class="off-site">Off-site link</a>
  </div>
</template>
<script>
import WithoutScrollRegion from "@/Layouts/WithoutScrollRegion";

export default {
  layout: WithoutScrollRegion,
  props: {
    foo: {
      type: String,
      default: 'default',
    },
  },
}
</script>
