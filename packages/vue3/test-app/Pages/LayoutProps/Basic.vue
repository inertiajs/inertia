<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'

export default {
  layout: AppLayout,
}
</script>

<script setup lang="ts">
import { Link, setLayoutProps } from '@inertiajs/vue3'
import { ref, watch } from 'vue'

const sidebarVisible = ref(true)

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value
}

watch(
  sidebarVisible,
  (value) => {
    setLayoutProps({ showSidebar: value })
  },
  { immediate: true },
)

setLayoutProps({
  title: 'Basic Layout Props',
})
</script>

<template>
  <div>
    <h2>Basic Layout Props Page</h2>
    <p>This page demonstrates setting layout props dynamically.</p>

    <div>
      <button type="button" @click="toggleSidebar">Toggle Sidebar</button>
      <span>Sidebar: {{ sidebarVisible ? 'visible' : 'hidden' }}</span>
    </div>

    <nav>
      <Link href="/layout-props/navigate">Go to Navigate Page</Link>
    </nav>
  </div>
</template>
