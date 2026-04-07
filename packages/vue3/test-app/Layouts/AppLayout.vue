<script setup lang="ts">
import { getCurrentInstance, onMounted } from 'vue'

onMounted(() => {
  window._inertia_app_layout_id = String(getCurrentInstance()?.uid)
})

const props = withDefaults(
  defineProps<{
    title?: string
    showSidebar?: boolean
    theme?: string
    formatTitle?: (name: string) => string
  }>(),
  {
    title: 'Default Title',
    showSidebar: true,
    theme: 'light',
    formatTitle: undefined,
  },
)
</script>

<template>
  <div :data-theme="props.theme" class="app-layout">
    <header>
      <h1 class="app-title">{{ props.formatTitle ? props.formatTitle('User') : props.title }}</h1>
    </header>
    <div class="app-content">
      <aside v-if="props.showSidebar" class="sidebar">
        <span>Sidebar</span>
      </aside>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
