import { progress } from '@inertiajs/react'
import { useState } from 'react'

declare global {
  interface Window {
    progressTests: unknown[]
  }
}

window.progressTests = []

export default () => {
  const [logs, setLogs] = useState<string[]>([])

  const log = (...args: unknown[]) => {
    const message = args.join(' ')
    window.progressTests.push(...args)
    setLogs((prevLogs) => [...prevLogs, message])
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
    setLogs([])
  }

  return (
    <div>
      <h1>Progress API Test</h1>

      <div>
        <button onClick={testStart}>Start</button>
        <button onClick={testSet25}>Set 25%</button>
        <button onClick={testSet50}>Set 50%</button>
        <button onClick={testSet75}>Set 75%</button>
        <button onClick={testFinish}>Finish</button>
      </div>

      <div>
        <button onClick={testReset}>Reset</button>
        <button onClick={testRemove}>Remove</button>
        <button onClick={testHide}>Hide</button>
        <button onClick={testReveal}>Reveal</button>
      </div>

      <div>
        <button onClick={testIsStarted}>Is Started</button>
        <button onClick={testGetStatus}>Get Status</button>
        <button onClick={clearLogs}>Clear</button>
      </div>

      <div>
        Logs: <span id="logs">{logs.join(', ')}</span>
      </div>
    </div>
  )
}
