<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()

const pushWithoutPreserving = () => {
  router.push({
    url: '/once-props/client-side-visit',
    component: 'OnceProps/ClientSideVisit',
    props: { bar: 'bar-updated' },
  })
}

const pushWithOnceProps = () => {
  router.push({
    url: '/once-props/client-side-visit',
    component: 'OnceProps/ClientSideVisit',
    props: (currentProps, onceProps) => ({ ...onceProps, bar: 'bar-updated' }),
  })
}
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <button @click="pushWithoutPreserving">Push without preserving</button>
  <button @click="pushWithOnceProps">Push with once props</button>
</template>
