<script setup>
import { onMounted, ref } from 'vue'

const createdAt = ref(null)

onMounted(() => {
  createdAt.value = Date.now()
})

// window._inertia_nested_layout_props = this.$vnode.data.props
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
