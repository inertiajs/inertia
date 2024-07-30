<script setup>
import { usePage } from '@inertiajs/vue3'
import { getCurrentInstance, onMounted, ref } from 'vue'

const createdAt = ref(null)

onMounted(() => {
  window._inertia_nested_layout_id = getCurrentInstance().uid
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
