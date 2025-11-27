<script module lang="ts">
  declare global {
    interface Window {
      progressTests: unknown[]
    }
  }
</script>

<script lang="ts">
  import { progress } from '@inertiajs/svelte'

  window.progressTests = []

  let logs: string[] = $state([])

  const log = (...args: unknown[]) => {
    const message = args.join(' ')
    window.progressTests.push(...args)
    logs = [...logs, message]
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
    logs = []
  }
</script>

<div>
  <h1>Progress API Test</h1>

  <div>
    <button onclick={testStart}>Start</button>
    <button onclick={testSet25}>Set 25%</button>
    <button onclick={testSet50}>Set 50%</button>
    <button onclick={testSet75}>Set 75%</button>
    <button onclick={testFinish}>Finish</button>
  </div>

  <div>
    <button onclick={testReset}>Reset</button>
    <button onclick={testRemove}>Remove</button>
    <button onclick={testHide}>Hide</button>
    <button onclick={testReveal}>Reveal</button>
  </div>

  <div>
    <button onclick={testIsStarted}>Is Started</button>
    <button onclick={testGetStatus}>Get Status</button>
    <button onclick={clearLogs}>Clear</button>
  </div>

  <div>
    Logs: <span id="logs">{logs.join(', ')}</span>
  </div>
</div>
