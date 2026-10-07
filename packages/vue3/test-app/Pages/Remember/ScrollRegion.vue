<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { ref, watchEffect } from 'vue'

const rows = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`)
const firstVisibleRow = ref(0)

watchEffect(() => {
  router.remember(firstVisibleRow.value, 'firstVisibleRow')
})

const onScroll = (event: Event) => {
  firstVisibleRow.value = Math.floor((event.target as HTMLElement).scrollTop / 40)
}
</script>

<template>
  <div>
    <Link href="/dump/get">Navigate away</Link>
    <p>First visible row: {{ firstVisibleRow }}</p>
    <div id="rows" scroll-region style="height: 200px; overflow-y: auto" @scroll="onScroll">
      <div v-for="row in rows" :key="row" style="height: 40px">{{ row }}</div>
    </div>
  </div>
</template>
