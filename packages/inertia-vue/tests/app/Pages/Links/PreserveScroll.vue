<template>
  <div style="height: 800px; width: 600px;">
    <span class="text">This is the links page that demonstrates scroll preservation with scroll regions</span>
    <span class="foo">Foo is now {{ foo }}</span>

    <inertia-link href="/links/preserve-scroll-page-two" preserve-scroll :data="{ foo: 'baz' }" class="preserve">Preserve Scroll</inertia-link>
    <inertia-link href="/links/preserve-scroll-page-two" :data="{ foo: 'bar' }" class="reset">Reset Scroll</inertia-link>

    <a href="/non-inertia" class="off-site">Off-site link</a>
  </div>
</template>
<script>
import WithScrollRegion from "@/Layouts/WithScrollRegion";

export default {
  layout: WithScrollRegion,
  props: {
    foo: {
      type: String,
      default: 'default',
    },
  },
}
</script>
