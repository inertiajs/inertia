<script lang="ts">
import usePoll from '../../../../../packages/vue3/src/usePoll'
import Layout from '../Components/Layout.vue'
import TestGrid from '../Components/TestGrid.vue'
import TestGridItem from '../Components/TestGridItem.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

defineProps<{
  users: string[]
  companies: string[]
}>()

const userPollCount = ref(0)
const hookPollCount = ref(0)
const companyPollCount = ref(0)

const triggerAsyncRedirect = () => {
  router.get(
    '/elsewhere',
    {},
    {
      only: ['something'],
      async: true,
    },
  )
}

const { start: startHookPolling, stop } = usePoll(
  2000,
  {
    only: ['asdf'],
    onFinish() {
      hookPollCount.value++
    },
  },
  {
    keepAlive: true,
    autoStart: false,
  },
)

onMounted(() => {
  setTimeout(() => {
    startHookPolling()
  }, 2000)

  const { stop: stopUserPolling } = router.poll(
    1000,
    {
      only: ['users'],
      onFinish() {
        userPollCount.value++
      },
    },
    { keepAlive: true },
  )

  setTimeout(() => {
    console.log('stopping user polling')
    stopUserPolling()
  }, 3000)
})
</script>

<template>
  <Head title="Async Request" />
  <h1 class="text-3xl">Poll</h1>
  <TestGrid>
    <TestGridItem>
      <template #title> User Poll Request Count: {{ userPollCount }} </template>
      <div v-for="user in users">
        <div>{{ user }}</div>
      </div>
    </TestGridItem>
    <TestGridItem>
      <template #title> Companies Poll Request Count: {{ companyPollCount }} </template>
      <div v-for="company in companies">
        <div>{{ company }}</div>
      </div>
    </TestGridItem>
    <TestGridItem>
      <template #title> Hook Poll Request Count: {{ hookPollCount }} </template>
    </TestGridItem>
    <TestGridItem>
      <button @click="triggerAsyncRedirect">Trigger Async Redirect</button>
    </TestGridItem>
  </TestGrid>
</template>
