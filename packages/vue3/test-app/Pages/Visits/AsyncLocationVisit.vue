<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { onMounted, onUnmounted, ref } from 'vue'

const draft = ref('')
const banner = ref('')
const bannerMode = ref(false)
const lastVersionChange = ref('')

let stopListening: VoidFunction

onMounted(() => {
  stopListening = router.on('location', (event) => {
    lastVersionChange.value = String(event.detail.versionChange)

    if (bannerMode.value && event.detail.versionChange) {
      event.preventDefault()
      banner.value = 'A new version is available'
    }
  })
})

onUnmounted(() => stopListening?.())

const backgroundReload = () => {
  router.reload({ headers: { 'X-Simulate-Version-Change': '1' } })
}

const backgroundManualLocation = () => {
  router.reload({ headers: { 'X-Simulate-Manual-Location': '1' } })
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates async location visits</span>

    <input id="draft" v-model="draft" />

    <button @click="backgroundReload" class="reload">Background reload</button>
    <button @click="backgroundManualLocation" class="manual-location">Background manual location</button>
    <button @click="bannerMode = !bannerMode" class="banner-mode">Banner mode: {{ bannerMode }}</button>

    <span id="version-change">{{ lastVersionChange }}</span>
    <span id="banner">{{ banner }}</span>
  </div>
</template>
