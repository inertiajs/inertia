<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { defineComponent, h, ref } from 'vue'

const CustomButton = defineComponent({
  name: 'CustomButton',
  render() {
    return h(
      'button',
      {
        style: {
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px',
        },
      },
      this.$slots.default?.(),
    )
  },
})

defineProps({
  page: Number,
})

declare global {
  interface Window {
    componentEvents: Array<{ eventName: string; data: unknown; timestamp: number }>
  }
}

window.componentEvents = []

const trackEvent = (eventName: string, data: unknown = null) => {
  window.componentEvents.push({ eventName, data, timestamp: Date.now() })
}

const state = ref(crypto.randomUUID())
</script>

<template>
  <div>
    <h1>Link Custom Component - Page {{ page }}</h1>
    <p id="state">State: {{ state }}</p>
    <Link :as="CustomButton" href="/dump/get" class="get"> GET Custom Component </Link>
    <Link :as="CustomButton" method="post" href="/dump/post" class="post"> POST Custom Component </Link>
    <Link :as="CustomButton" method="post" href="/dump/post" :data="{ test: 'data' }" class="data">
      Custom Component with Data
    </Link>
    <Link :as="CustomButton" href="/dump/get" :headers="{ 'X-Test': 'header' }" class="headers">
      Custom Component with Headers
    </Link>
    <Link :as="CustomButton" href="/links/as-component/2" :preserve-state="true" class="preserve">
      Custom Component with Preserve State
    </Link>
    <Link :as="CustomButton" href="/links/as-component/3" :replace="true" class="replace"
      >Custom Component with Replace</Link
    >
    <Link
      :as="CustomButton"
      href="/dump/get"
      @start="(event) => trackEvent('onStart', event)"
      @finish="(event) => trackEvent('onFinish', event)"
      @success="(page) => trackEvent('onSuccess', page)"
      class="events"
    >
      Custom Component with Events
    </Link>
  </div>
</template>
