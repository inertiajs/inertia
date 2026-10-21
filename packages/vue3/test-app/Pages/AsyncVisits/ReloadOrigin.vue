<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'

const reloadStatus = ref('idle')

const reload = () => router.reload({ headers: { 'X-Repro-Delay': '1' } })

const visitPage2AndReload = () => {
  router.visit('/async-visits/reload-origin?page=2', { preserveState: true })

  router.reload({
    headers: { 'X-Repro-Delay': '1' },
    onFinish: () => (reloadStatus.value = 'finished'),
  })
}
</script>

<template>
  <div>Page: Reload Origin</div>

  <button @click="reload">Reload</button>
  <button @click="visitPage2AndReload">Visit page 2 and reload</button>
  <Link href="/async-visits/page-c">Go to C</Link>

  <div>Reload: {{ reloadStatus }}</div>
</template>
