<script setup lang="ts">
import { ref } from 'vue'

const settled = ref(false)
const historyDelta = ref<number | null>(null)
const search = ref('')

if (typeof window !== 'undefined') {
  // Simulate an app (or third-party library) that adds a query param via the
  // History API while the page is mounting, before Inertia's queued initial
  // history write has flushed.
  const historyLengthAtMount = window.history.length
  window.history.replaceState(window.history.state, '', '/url-on-mount?step=1')

  document.addEventListener(
    'inertia:navigate',
    () => {
      historyDelta.value = window.history.length - historyLengthAtMount
      search.value = window.location.search
      settled.value = true
    },
    { once: true },
  )
}
</script>

<template>
  <div>
    <h1>Url On Mount</h1>
    <div v-if="settled" id="settled">
      <span class="search">{{ search }}</span>
      <span class="history-delta">{{ historyDelta }}</span>
    </div>
  </div>
</template>
