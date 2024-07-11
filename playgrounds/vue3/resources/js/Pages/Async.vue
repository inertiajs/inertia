<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, router, useForm } from '@inertiajs/vue3'
import { ref, watch } from 'vue'

let timer = null
const reloadCount = ref(0)

const props = defineProps<{
  jonathan: boolean
  taylor: boolean
  joe: boolean
}>()

const form = useForm({
  jonathan: props.jonathan,
  taylor: props.taylor,
  joe: props.joe,
})

watch(form, () => {
  router.post(
    '/async/checkbox',
    {
      jonathan: form.jonathan,
      taylor: form.taylor,
      joe: form.joe,
    },
    {
      async: true,
    },
  )
})

const simulateConflict = () => {
  router.reload({
    only: ['sleep'],
  })
  router.visit('/sleepy/2')
}

const triggerVisitThenReload = () => {
  router.visit('/sleepy/1')
  router.reload({
    only: ['sleep'],
  })
}

const triggerLongReload = () => {
  router.reload({
    only: ['sleep'],
    onFinish() {
      console.log('finished reload')
      reloadCount.value++
      console.log('incremented reload count')
    },
  })
}

const triggerCancel = () => {
  router.post(
    '/sleepy/3',
    {},
    {
      onCancelToken: (token) => {
        console.log('onCancelToken')

        setTimeout(() => {
          console.log('CANCELLING!')
          token.cancel()
        }, 1000)
      },
    },
  )
}

const triggerCancelAfterFinish = () => {
  let cancelToken

  router.post(
    '/sleepy/1',
    {},
    {
      onCancelToken: (token) => {
        console.log('onCancelToken')

        cancelToken = token
      },
      onFinish: () => {
        console.log('onFinish')
        console.log('CANCELLING!')
        cancelToken.cancel()
      },
    },
  )
}

watch(reloadCount, () => {
  console.log('watched reload count value', reloadCount.value)
})
</script>

<template>
  <Head title="Async Request" />
  <h1 class="text-3xl">Async Request</h1>
  <p class="mt-6">Reload Count: {{ reloadCount }}</p>
  <div class="grid grid-cols-3 gap-4 mt-6">
    <div class="p-4 space-y-4 text-sm text-gray-500 border border-gray-300 rounded">
      <p>Trigger an async reload that takes a moment and immediately programatically visit another page</p>
      <button @click="simulateConflict" class="px-4 py-2 text-white bg-green-600 rounded">Reload → Visit</button>
    </div>
    <div class="p-4 space-y-4 text-sm text-gray-500 border border-gray-300 rounded">
      <div class="flex flex-col">
        <label>
          <input v-model="form.jonathan" type="checkbox" class="mr-2" />
          Jonathan
        </label>
        <label>
          <input v-model="form.taylor" type="checkbox" class="mr-2" />
          Taylor
        </label>
        <label>
          <input v-model="form.joe" type="checkbox" class="mr-2" />
          Joe
        </label>
      </div>
      <p>You can check these on and off and then navigate to another page and the requests should still complete.</p>
      <p>Toggling "Joe" on will cause a redirect to "Article", simulating an authorized action e.g.</p>
    </div>
    <div class="p-4 space-y-4 text-sm text-gray-500 border border-gray-300 rounded">
      <p>Trigger programatic visit and an async reload one after another</p>

      <p>Reload should still happen but won't re-direct back to the reloaded component, we should respect the visit</p>

      <button @click="triggerVisitThenReload" class="px-4 py-2 text-white bg-green-600 rounded">Visit → Reload</button>
    </div>
    <div class="p-4 space-y-4 text-sm text-gray-500 border border-gray-300 rounded">
      <p>Simply trigger a 4 second reload so you can navigate or do whatever you'd like during it.</p>
      <button @click="triggerLongReload" class="px-4 py-2 text-white bg-green-600 rounded">Trigger Long Reload</button>
    </div>
    <div class="p-4 space-y-4 text-sm text-gray-500 border border-gray-300 rounded">
      <p>Trigger an automatic cancellation from the token.</p>
      <button @click="triggerCancel" class="px-4 py-2 text-white bg-green-600 rounded">Trigger Cancel</button>
    </div>
    <div class="p-4 space-y-4 text-sm text-gray-500 border border-gray-300 rounded">
      <p>Trigger an automatic cancellation from the token after finishing request.</p>
      <button @click="triggerCancelAfterFinish" class="px-4 py-2 text-white bg-green-600 rounded">
        Trigger Cancel After Finish
      </button>
    </div>
  </div>
</template>
