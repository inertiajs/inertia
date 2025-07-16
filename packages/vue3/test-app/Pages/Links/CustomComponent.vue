<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { defineComponent, h, ref, onMounted } from 'vue'

window.customComponentEvents = []

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

const trackEvent = (eventName: string, data: any = null) => {
  window.customComponentEvents.push({ eventName, data, timestamp: Date.now() })
}
</script>

<template>
  <div>
    <Link :as="CustomButton" href="/dump/get" class="get"> GET Custom Component </Link>
    <Link :as="CustomButton" method="post" href="/dump/post" class="post"> POST Custom Component </Link>
    <Link :as="CustomButton" method="post" href="/dump/post" :data="{ test: 'data' }" class="data">
      Custom Component with Data
    </Link>
    <Link :as="CustomButton" href="/dump/get" :headers="{ 'X-Test': 'header' }" class="headers">
      Custom Component with Headers
    </Link>
    <Link :as="CustomButton" href="/dump/get" :preserveState="true" class="preserve">
      Custom Component with Preserve State
    </Link>
    <Link :as="CustomButton" href="/dump/get" :replace="true" class="replace">Custom Component with Replace</Link>
    <Link
      :as="CustomButton"
      href="/dump/get"
      :onStart="(event) => trackEvent('onStart', event)"
      :onFinish="(event) => trackEvent('onFinish', event)"
      :onSuccess="(page) => trackEvent('onSuccess', page)"
      class="events"
    >
      Custom Component with Events
    </Link>
  </div>
</template>
