<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const pushFunctionProp = () => {
  router.push({
    url: '/history/non-serializable/target',
    component: 'History/NonSerializableTarget',
    props: { message: 'Target page', onAction: () => 'action from the function prop' },
  })
}
</script>

<template>
  <button @click="pushFunctionProp">Push a function prop</button>
</template>
