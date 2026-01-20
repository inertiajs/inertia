<script setup lang="ts">
import { progress } from '@inertiajs/vue3'
import { ref } from 'vue'

declare global {
  interface Window {
    progressTests: unknown[]
  }
}

window.progressTests = []

const logs = ref<string[]>([])

const log = (...args: unknown[]) => {
  const message = args.join(' ')
  window.progressTests.push(...args)
  logs.value.push(message)
}

const testStart = () => {
  progress.start()
  log('started')
}

const testSet25 = () => {
  progress.set(0.25)
  log('set 25%')
}

const testSet50 = () => {
  progress.set(0.5)
  log('set 50%')
}

const testSet75 = () => {
  progress.set(0.75)
  log('set 75%')
}

const testFinish = () => {
  progress.finish()
  log('finished')
}

const testReset = () => {
  progress.reset()
  log('reset')
}

const testRemove = () => {
  progress.remove()
  log('removed')
}

const testHide = () => {
  progress.hide()
  log('hidden')
}

const testReveal = () => {
  progress.reveal()
  log('revealed')
}

const testIsStarted = () => {
  log('isStarted:', progress.isStarted())
}

const testGetStatus = () => {
  log('getStatus:', progress.getStatus())
}

const clearLogs = () => {
  window.progressTests = []
  logs.value = []
}
</script>

<template>
  <div>
    <h1>Progress API Test</h1>

    <div>
      <button @click="testStart">Start</button>
      <button @click="testSet25">Set 25%</button>
      <button @click="testSet50">Set 50%</button>
      <button @click="testSet75">Set 75%</button>
      <button @click="testFinish">Finish</button>
    </div>

    <div>
      <button @click="testReset">Reset</button>
      <button @click="testRemove">Remove</button>
      <button @click="testHide">Hide</button>
      <button @click="testReveal">Reveal</button>
    </div>

    <div>
      <button @click="testIsStarted">Is Started</button>
      <button @click="testGetStatus">Get Status</button>
      <button @click="clearLogs">Clear</button>
    </div>

    <div>
      Logs: <span id="logs">{{ logs.join(', ') }}</span>
    </div>
  </div>
</template>
