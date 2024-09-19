<script setup>
import WithScrollRegion from '@/Layouts/WithScrollRegion.vue'
import { router } from '@inertiajs/vue3'

defineOptions({
  layout: WithScrollRegion,
})

defineProps({
  foo: {
    type: String,
    default: 'default',
  },
})

const preserve = () => {
  router.visit('/visits/preserve-scroll-page-two', {
    data: { foo: 'foo' },
    preserveScroll: true,
  })
}

const preserveFalse = () => {
  router.visit('/visits/preserve-scroll-page-two', {
    data: { foo: 'bar' },
  })
}

const preserveCallback = () => {
  router.visit('/visits/preserve-scroll-page-two', {
    data: { foo: 'baz' },
    preserveScroll: (page) => {
      console.log(JSON.stringify(page))

      return true
    },
  })
}

const preserveCallbackFalse = () => {
  router.visit('/visits/preserve-scroll-page-two', {
    data: { foo: 'foo' },
    preserveScroll: (page) => {
      console.log(JSON.stringify(page))

      return false
    },
  })
}

const preserveGet = () => {
  router.get(
    '/visits/preserve-scroll-page-two',
    {
      foo: 'bar',
    },
    {
      preserveScroll: true,
    },
  )
}

const preserveGetFalse = () => {
  router.get('/visits/preserve-scroll-page-two', {
    foo: 'baz',
  })
}
</script>

<template>
  <div style="height: 800px; width: 600px">
    <span class="text"
      >This is the page that demonstrates scroll preservation with scroll regions when using manual visits</span
    >
    <span class="foo">Foo is now {{ foo }}</span>

    <a href="#" @click.prevent="preserve" class="preserve">Preserve Scroll</a>
    <a href="#" @click.prevent="preserveFalse" class="reset">Reset Scroll</a>
    <a href="#" @click.prevent="preserveCallback" class="preserve-callback">Preserve Scroll (Callback)</a>
    <br />
    <a href="#" @click.prevent="preserveCallbackFalse" class="reset-callback">Reset Scroll (Callback)</a>
    <a href="#" @click.prevent="preserveGet" class="preserve-get">Preserve Scroll (GET)</a>
    <a href="#" @click.prevent="preserveGetFalse" class="reset-get">Reset Scroll (GET)</a>

    <a href="/non-inertia" class="off-site">Off-site link</a>
  </div>
</template>
