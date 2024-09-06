<script setup>
import { Link } from '@inertiajs/vue3'
import WithScrollRegion from '../../Layouts/WithScrollRegion.vue'

defineOptions({
  layout: WithScrollRegion,
})

defineProps({
  foo: {
    type: String,
    default: 'default',
  },
})

const preserveCallback = (page) => {
  console.log(JSON.stringify(page))

  return true
}

const preserveCallbackFalse = (page) => {
  console.log(JSON.stringify(page))

  return false
}
</script>

<template>
  <div style="height: 800px; width: 600px">
    <span class="text">This is the links page that demonstrates scroll preservation with scroll regions</span>
    <span class="foo">Foo is now {{ foo }}</span>

    <Link
      href="/links/preserve-scroll-page-two"
      preserve-scroll
      :data="{ foo: 'baz' }"
      class="preserve"
      data-testid="preserve"
      >Preserve Scroll</Link
    >
    <Link href="/links/preserve-scroll-page-two" :data="{ foo: 'bar' }" class="reset" data-testid="reset"
      >Reset Scroll</Link
    >

    <Link
      href="/links/preserve-scroll-page-two"
      :preserve-scroll="preserveCallback"
      :data="{ foo: 'baz' }"
      class="preserve-callback"
      data-testid="preserve-callback"
      >Preserve Scroll (Callback)</Link
    >
    <Link
      href="/links/preserve-scroll-page-two"
      :preserve-scroll="preserveCallbackFalse"
      :data="{ foo: 'foo' }"
      class="reset-callback"
      data-testid="reset-callback"
      >Reset Scroll (Callback)</Link
    >

    <a href="/non-inertia" class="off-site" style="display: block">Off-site link</a>
  </div>
</template>
