<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  foo: string
  bar: string
}>()

const replace = () => {
  router.replace({
    props: (props) => ({ ...props, foo: 'foo from client' }),
  })
}

const push = () => {
  router.push({
    url: '/client-side-visit-2',
    component: 'ClientSideVisit/Page2',
    props: {
      baz: 'baz from client',
    },
  })
}
</script>

<template>
  <div>{{ foo }}</div>
  <div>{{ bar }}</div>
  <button @click="replace">Replace</button>
  <button @click="push">Push</button>
</template>
