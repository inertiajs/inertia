<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

const id = String(Date.now() + Math.random())
const createdAt = ref<number | null>(null)

onMounted(() => {
  window._inertia_nested_layout_id = id
  window._inertia_nested_layout_props = usePage().props
  createdAt.value = Date.now()
})
</script>

<template>
  <div>
    <span>Nested Layout</span>
    <span>{{ createdAt }}</span>
    <div>
      <slot />
    </div>
  </div>
</template>
