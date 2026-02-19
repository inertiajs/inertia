<script setup lang="ts">
import { useLayoutProps } from '@inertiajs/vue3'
import { getCurrentInstance, onMounted } from 'vue'

onMounted(() => {
  window._inertia_app_layout_id = String(getCurrentInstance()?.uid)
})

const layoutProps = useLayoutProps({
  title: 'Default Title',
  showSidebar: true,
  theme: 'light',
})
</script>

<template>
  <div :data-theme="layoutProps.theme" class="app-layout">
    <header>
      <h1 class="app-title">{{ layoutProps.title }}</h1>
    </header>
    <div class="app-content">
      <aside v-if="layoutProps.showSidebar" class="sidebar">
        <span>Sidebar</span>
      </aside>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
