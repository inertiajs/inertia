<script setup lang="ts">
import type { Page } from '@inertiajs/core'
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

interface ComponentProps {
  foo: {
    data: { id: number; name: string }[]
    page: number
    per_page: number
    meta: { label: string }
  }
  bar: number[]
  baz: number[]
}

const props = defineProps<ComponentProps>()

const page = ref(props.foo.page)

const reloadIt = () => {
  router.reload({
    data: {
      page: page.value,
    },
    only: ['foo', 'baz'],
    onSuccess(visit: Page) {
      // TODO: Refactor 'unknown' and make Page<ComponentProps> work
      const visitProps = visit.props as unknown as Pick<ComponentProps, 'foo' | 'baz'>
      page.value = visitProps.foo.page
    },
  })
}

const getFresh = () => {
  page.value = 0
  router.visit('/deep-merge-props', {
    reset: ['foo', 'baz'],
  })
}
</script>

<template>
  <div>bar count is {{ bar.length }}</div>
  <div>baz count is {{ baz.length }}</div>
  <div>foo.data count is {{ foo.data.length }}</div>
  <div>foo.page is {{ foo.page }}</div>
  <div>foo.per_page is {{ foo.per_page }}</div>
  <div>foo.meta.label is {{ foo.meta.label }}</div>
  <button @click="reloadIt">Reload</button>
  <button @click="getFresh">Get Fresh</button>
</template>
