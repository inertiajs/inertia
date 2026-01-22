<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface LifecycleResponse {
  success: boolean
  message: string
  received: Record<string, unknown>
}

const lifecycleTest = useHttp<{ value: string }, LifecycleResponse>({
  value: '',
})

const lifecycleErrorTest = useHttp<{ value: string }, LifecycleResponse>({
  value: '',
})

const onBeforeCancelTest = useHttp<{ value: string }, LifecycleResponse>({
  value: '',
})

const lifecycleEvents = ref<string[]>([])
const lifecycleErrorEvents = ref<string[]>([])
const onBeforeCancelled = ref(false)

const performLifecycleTest = async () => {
  lifecycleEvents.value = []
  try {
    await lifecycleTest.post('/api/lifecycle', {
      onBefore: () => {
        lifecycleEvents.value.push('onBefore')
      },
      onStart: () => {
        lifecycleEvents.value.push('onStart')
      },
      onSuccess: () => {
        lifecycleEvents.value.push('onSuccess')
      },
      onError: () => {
        lifecycleEvents.value.push('onError')
      },
      onFinish: () => {
        lifecycleEvents.value.push('onFinish')
      },
    })
  } catch {
    // Error handling
  }
}

const performLifecycleErrorTest = async () => {
  lifecycleErrorEvents.value = []
  try {
    await lifecycleErrorTest.post('/api/lifecycle-error', {
      onBefore: () => {
        lifecycleErrorEvents.value.push('onBefore')
      },
      onStart: () => {
        lifecycleErrorEvents.value.push('onStart')
      },
      onSuccess: () => {
        lifecycleErrorEvents.value.push('onSuccess')
      },
      onError: () => {
        lifecycleErrorEvents.value.push('onError')
      },
      onFinish: () => {
        lifecycleErrorEvents.value.push('onFinish')
      },
    })
  } catch {
    // Expected error
  }
}

const performOnBeforeCancelTest = async () => {
  onBeforeCancelled.value = false
  try {
    await onBeforeCancelTest.post('/api/lifecycle', {
      onBefore: () => {
        onBeforeCancelled.value = true
        return false
      },
    })
  } catch {
    // Should not reach here
  }
}
</script>

<template>
  <div>
    <h1>useHttp Lifecycle Callbacks Test</h1>

    <!-- Lifecycle Callbacks Test -->
    <section id="lifecycle-test">
      <h2>Lifecycle Callbacks</h2>
      <label>
        Value
        <input type="text" id="lifecycle-value" v-model="lifecycleTest.value" />
      </label>
      <button @click="performLifecycleTest" id="lifecycle-button">Test Lifecycle (Success)</button>
      <button @click="performLifecycleErrorTest" id="lifecycle-error-button">Test Lifecycle (Error)</button>
      <button @click="performOnBeforeCancelTest" id="lifecycle-cancel-button">Test onBefore Cancel</button>
      <div id="lifecycle-events">Events: {{ lifecycleEvents.join(', ') }}</div>
      <div id="lifecycle-error-events">Error Events: {{ lifecycleErrorEvents.join(', ') }}</div>
      <div v-if="onBeforeCancelled" id="lifecycle-cancelled">onBefore returned false - request cancelled</div>
      <div v-if="onBeforeCancelTest.processing" id="lifecycle-cancel-processing">Processing...</div>
    </section>
  </div>
</template>
