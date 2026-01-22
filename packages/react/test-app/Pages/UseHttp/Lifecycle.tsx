import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

interface LifecycleResponse {
  success: boolean
  message: string
  received: Record<string, any>
}

export default () => {
  const lifecycleTest = useHttp<{ value: string }, LifecycleResponse>({
    value: '',
  })

  const lifecycleErrorTest = useHttp<{ value: string }, LifecycleResponse>({
    value: '',
  })

  const onBeforeCancelTest = useHttp<{ value: string }, LifecycleResponse>({
    value: '',
  })

  const [lifecycleEvents, setLifecycleEvents] = useState<string[]>([])
  const [lifecycleErrorEvents, setLifecycleErrorEvents] = useState<string[]>([])
  const [onBeforeCancelled, setOnBeforeCancelled] = useState(false)

  const performLifecycleTest = async () => {
    const events: string[] = []
    setLifecycleEvents([])
    try {
      await lifecycleTest.post('/api/lifecycle', {
        onBefore: () => {
          events.push('onBefore')
          setLifecycleEvents([...events])
        },
        onStart: () => {
          events.push('onStart')
          setLifecycleEvents([...events])
        },
        onSuccess: () => {
          events.push('onSuccess')
          setLifecycleEvents([...events])
        },
        onError: () => {
          events.push('onError')
          setLifecycleEvents([...events])
        },
        onFinish: () => {
          events.push('onFinish')
          setLifecycleEvents([...events])
        },
      })
    } catch (e) {
      console.error('Lifecycle test failed:', e)
    }
  }

  const performLifecycleErrorTest = async () => {
    const events: string[] = []
    setLifecycleErrorEvents([])
    try {
      await lifecycleErrorTest.post('/api/lifecycle-error', {
        onBefore: () => {
          events.push('onBefore')
          setLifecycleErrorEvents([...events])
        },
        onStart: () => {
          events.push('onStart')
          setLifecycleErrorEvents([...events])
        },
        onSuccess: () => {
          events.push('onSuccess')
          setLifecycleErrorEvents([...events])
        },
        onError: () => {
          events.push('onError')
          setLifecycleErrorEvents([...events])
        },
        onFinish: () => {
          events.push('onFinish')
          setLifecycleErrorEvents([...events])
        },
      })
    } catch (e) {
      // Expected error
    }
  }

  const performOnBeforeCancelTest = async () => {
    setOnBeforeCancelled(false)
    try {
      await onBeforeCancelTest.post('/api/lifecycle', {
        onBefore: () => {
          setOnBeforeCancelled(true)
          return false
        },
      })
    } catch (e) {
      // Should not reach here
    }
  }

  return (
    <div>
      <h1>useHttp Lifecycle Callbacks Test</h1>

      {/* Lifecycle Callbacks Test */}
      <section id="lifecycle-test">
        <h2>Lifecycle Callbacks</h2>
        <label>
          Value
          <input
            type="text"
            id="lifecycle-value"
            value={lifecycleTest.data.value}
            onChange={(e) => lifecycleTest.setData('value', e.target.value)}
          />
        </label>
        <button onClick={performLifecycleTest} id="lifecycle-button">
          Test Lifecycle (Success)
        </button>
        <button onClick={performLifecycleErrorTest} id="lifecycle-error-button">
          Test Lifecycle (Error)
        </button>
        <button onClick={performOnBeforeCancelTest} id="lifecycle-cancel-button">
          Test onBefore Cancel
        </button>
        <div id="lifecycle-events">Events: {lifecycleEvents.join(', ')}</div>
        <div id="lifecycle-error-events">Error Events: {lifecycleErrorEvents.join(', ')}</div>
        {onBeforeCancelled && <div id="lifecycle-cancelled">onBefore returned false - request cancelled</div>}
        {onBeforeCancelTest.processing && <div id="lifecycle-cancel-processing">Processing...</div>}
      </section>
    </div>
  )
}
