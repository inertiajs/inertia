<script setup lang="ts">
const props = defineProps<{
  dialog: boolean
}>()

import { config, router } from '@inertiajs/vue3'

const invalidVisit = () => {
  router.post('/non-inertia')
}

const invalidVisitJson = () => {
  router.post('/json')
}

if (props.dialog) {
  config.set('future.useDialogForErrorModal', true)
}
</script>

<template>
  <div>
    <span @click="invalidVisit" class="invalid-visit">Invalid Visit</span>
    <span @click="invalidVisitJson" class="invalid-visit-json">Invalid Visit (JSON response)</span>
  </div>
</template>
