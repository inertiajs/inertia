<template>
  <div style="height: 800px; width: 600px">
    <span class="text"
      >This is the page that demonstrates scroll preservation without scroll regions when using manual visits</span
    >
    <span class="foo">Foo is now {{ foo }}</span>

    <span @click="preserve" class="preserve">Preserve Scroll</span>
    <span @click="preserveFalse" class="reset">Reset Scroll</span>
    <span @click="preserveCallback" class="preserve-callback">Preserve Scroll (Callback)</span>
    <span @click="preserveCallbackFalse" class="reset-callback">Reset Scroll (Callback)</span>
    <span @click="preserveGet" class="preserve-get">Preserve Scroll (GET)</span>
    <span @click="preserveGetFalse" class="reset-get">Reset Scroll (GET)</span>

    <a href="/non-inertia" class="off-site">Off-site link</a>
  </div>
</template>
<script>
import WithoutScrollRegion from '@/Layouts/WithoutScrollRegion.vue'

export default {
  layout: WithoutScrollRegion,
  props: {
    foo: {
      type: String,
      default: 'default',
    },
  },
  methods: {
    preserve() {
      this.$inertia.visit('/visits/preserve-scroll-false-page-two', {
        data: { foo: 'foo' },
        preserveScroll: true,
      })
    },
    preserveFalse() {
      this.$inertia.visit('/visits/preserve-scroll-false-page-two', {
        data: { foo: 'bar' },
      })
    },
    preserveCallback() {
      this.$inertia.visit('/visits/preserve-scroll-false-page-two', {
        data: { foo: 'baz' },
        preserveScroll: (page) => {
          alert(page)

          return true
        },
      })
    },
    preserveCallbackFalse() {
      this.$inertia.visit('/visits/preserve-scroll-false-page-two', {
        data: { foo: 'foo' },
        preserveScroll: (page) => {
          alert(page)

          return false
        },
      })
    },
    preserveGet() {
      this.$inertia.get(
        '/visits/preserve-scroll-false-page-two',
        {
          foo: 'bar',
        },
        {
          preserveScroll: true,
        },
      )
    },
    preserveGetFalse() {
      this.$inertia.get('/visits/preserve-scroll-false-page-two', {
        foo: 'baz',
      })
    },
  },
}
</script>
