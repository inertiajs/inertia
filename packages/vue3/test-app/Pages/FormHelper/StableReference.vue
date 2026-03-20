<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { computed, ref, watch } from 'vue'

const form = useForm({ name: '' })

const renderCount = ref(0)

const submitForm = computed(() => {
  return () =>
    form.post('/form-helper/stable-reference', {
      preserveState: true,
    })
})

watch(
  submitForm,
  (fn) => {
    renderCount.value++
    fn()
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <h1>useForm Stable Reference Test</h1>
    <div id="render-count">Render count: {{ renderCount }}</div>
    <div v-if="form.recentlySuccessful" id="recently-successful">Recently successful</div>
    <div v-if="form.wasSuccessful" id="was-successful">Was successful</div>
  </div>
</template>
