<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3'
import { ref, watch } from 'vue'
import PreserveEqualPropsLayout from '@/Layouts/PreserveEqualPropsLayout.vue'

defineOptions({
  layout: PreserveEqualPropsLayout,
})

const props = defineProps<{
  file: { url: string; pages: number }
  tick: number
}>()

const page = usePage<{ file: { url: string; pages: number } }>()
const effectCount = ref(0)
const storeEffectCount = ref(0)

watch(
  () => props.file,
  () => {
    effectCount.value++
  },
  { immediate: true },
)

watch(
  () => page.props.file,
  () => {
    storeEffectCount.value++
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <p id="file">File: {{ file.url }}</p>
    <p id="tick">Tick: {{ tick }}</p>
    <p id="flash">Flash: {{ JSON.stringify(page.flash) }}</p>
    <p id="effect-count">Effect count: {{ effectCount }}</p>
    <p id="store-effect-count">Store effect count: {{ storeEffectCount }}</p>

    <button @click="router.reload({ only: ['tick'], data: { tick: tick + 1 } })">Reload tick only</button>
    <button @click="router.reload({ data: { tick: tick + 1 } })">Reload all props</button>
    <button @click="router.flash({ message: 'Saved' })">Set flash</button>
    <button @click="router.reload({ data: { tick: tick + 1, file: 'other' } })">Change file</button>
    <button @click="page.props.file.url = '/files/edited.pdf'">Edit file locally</button>
  </div>
</template>
