<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{
  foo: string
  bar: string
}>()

const replaced = ref(0)

const replace = () => {
  router.replace({
    preserveState: true,
    props: (props) => ({ ...props, foo: 'foo from client' }),
    onSuccess: () => replaced.value++,
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
  <div>Replaced: {{ replaced }}</div>
</template>
