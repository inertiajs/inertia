<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { ref, watch } from 'vue'

const props = defineProps<{
  nestedA: { count: number }
  nestedB: { date: number }
}>()

const effectACount = ref(1)
const effectBCount = ref(1)

watch(
  () => props.nestedA,
  () => {
    effectACount.value++
  },
)

watch(
  () => props.nestedB,
  () => {
    effectBCount.value++
  },
)
</script>

<template>
  <div>
    <h1>Preserve Equal Props</h1>
    <p id="count-a">Count A: {{ nestedA.count }}</p>
    <p id="date-b">Date B: {{ nestedB.date }}</p>
    <p id="effect-a">Effect A Count: {{ effectACount }}</p>
    <p id="effect-b">Effect B Count: {{ effectBCount }}</p>
    <Link method="post" preserve-state href="/preserve-equal-props/back"> Submit and redirect back </Link>
  </div>
</template>
