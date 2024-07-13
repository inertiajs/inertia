<script lang="ts">
import usePoll from '../../../../../packages/vue3/src/usePoll'
import Layout from '../Components/Layout.vue'
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

const trigegerAsyncRedirect = () => {
  router.get(
    '/elsewhere',
    {},
    {
      only: ['something'],
      async: true,
    },
  )
}

const { start, stop } = usePoll(
  2000,
  {
    only: ['asdf'],
    onFinish() {
      hookPollCount.value++
    },
  },
  {
    keepAlive: true,
    startOnMount: false,
  },
)

onMounted(() => {
  setTimeout(() => {
    start()
  }, 2000)

  const stopUserPolling = router.poll(
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
  }, 7000)

  router.poll(1500, {
    only: ['companies'],
    onFinish() {
      companyPollCount.value++
    },
  })
})
</script>

<template>
  <Head title="Async Request" />
  <h1 class="text-3xl">Poll</h1>
  <div class="flex mt-6 space-x-6">
    <div>
      <div class="mb-2 font-bold">User Poll Request Count: {{ userPollCount }}</div>
      <div v-for="user in users">
        <div>{{ user }}</div>
      </div>
    </div>
    <div>
      <div class="mb-2 font-bold">Companies Poll Request Count: {{ companyPollCount }}</div>
      <div v-for="company in companies">
        <div>{{ company }}</div>
      </div>
    </div>
    <div>
      <div class="mb-2 font-bold">Hook Count: {{ hookPollCount }}</div>
    </div>
    <div>
      <button @click="trigegerAsyncRedirect">Trigger Async Redirect</button>
    </div>
  </div>
</template>
