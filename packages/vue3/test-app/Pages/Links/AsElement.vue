<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { ref } from 'vue'

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
    <h1>Link Custom Element - Page {{ page }}</h1>
    <p id="state">State: {{ state }}</p>
    <Link as="div" href="/dump/get" class="get" style="background-color: blue; color: white; padding: 10px">
      GET Custom Element
    </Link>
    <Link as="div" method="post" href="/dump/post" class="post"> POST Custom Element </Link>
    <Link as="div" method="post" href="/dump/post" :data="{ test: 'data' }" class="data">
      Custom Element with Data
    </Link>
    <Link as="div" href="/dump/get" :headers="{ 'X-Test': 'header' }" class="headers">
      Custom Element with Headers
    </Link>
    <Link as="div" href="/links/as-element/2" :preserve-state="true" class="preserve">
      Custom Element with Preserve State
    </Link>
    <Link as="div" href="/links/as-element/3" :replace="true" class="replace">Custom Element with Replace</Link>
    <Link
      as="div"
      href="/dump/get"
      @start="(event) => trackEvent('onStart', event)"
      @finish="(event) => trackEvent('onFinish', event)"
      @success="(page) => trackEvent('onSuccess', page)"
      class="events"
    >
      Custom Element with Events
    </Link>
  </div>
</template>
