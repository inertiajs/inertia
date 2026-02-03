import { useOptimistic } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [cancelCount, setCancelCount] = useState(0)

  const feature = useOptimistic({ enabled: false })
  const review = useOptimistic({ rating: 3, comment: '' })
  const counter = useOptimistic({ count: 0 })
  const errorTest = useOptimistic({ value: 'initial' })
  const cancelTest = useOptimistic({ value: 'initial' })

  const toggleFeature = () => {
    feature.patch('/api/optimistic/feature', (current) => ({ enabled: !current.enabled }), {
      onSuccess: () => setSuccessCount((c) => c + 1),
      onError: () => setErrorCount((c) => c + 1),
    })
  }

  const updateReview = (rating: number) => {
    review.patch('/api/optimistic/review', { rating }, {
      onSuccess: () => setSuccessCount((c) => c + 1),
      onError: () => setErrorCount((c) => c + 1),
    })
  }

  const incrementCounter = () => {
    counter.post('/api/optimistic/counter', (current) => ({ count: current.count + 1 }), {
      onSuccess: () => setSuccessCount((c) => c + 1),
      onError: () => setErrorCount((c) => c + 1),
    })
  }

  const triggerError = () => {
    errorTest.patch('/api/optimistic/error', { value: 'optimistic' }, {
      onSuccess: () => setSuccessCount((c) => c + 1),
      onError: () => setErrorCount((c) => c + 1),
    })
  }

  const triggerCancel = () => {
    cancelTest.patch('/api/optimistic/slow', { value: 'optimistic' }, {
      onSuccess: () => setSuccessCount((c) => c + 1),
      onError: () => setErrorCount((c) => c + 1),
      onCancel: () => setCancelCount((c) => c + 1),
    })
  }

  const cancelRequest = () => {
    cancelTest.cancel()
  }

  const resetAll = () => {
    feature.reset()
    review.reset()
    counter.reset()
    errorTest.reset()
    cancelTest.reset()
    setSuccessCount(0)
    setErrorCount(0)
    setCancelCount(0)
  }

  return (
    <div>
      <h1>useOptimistic</h1>

      <section>
        <h2>Feature Toggle (Callback Form)</h2>
        <p id="feature-status">Feature: {feature.value.enabled ? 'Enabled' : 'Disabled'}</p>
        {feature.processing && <p id="feature-processing">Processing...</p>}
        <button id="toggle-feature" onClick={toggleFeature}>Toggle Feature</button>
      </section>

      <section>
        <h2>Review Rating (Merge Form)</h2>
        <p id="review-rating">Rating: {review.value.rating}</p>
        {review.processing && <p id="review-processing">Processing...</p>}
        <div>
          <button id="rate-1" onClick={() => updateReview(1)}>1 Star</button>
          <button id="rate-2" onClick={() => updateReview(2)}>2 Stars</button>
          <button id="rate-3" onClick={() => updateReview(3)}>3 Stars</button>
          <button id="rate-4" onClick={() => updateReview(4)}>4 Stars</button>
          <button id="rate-5" onClick={() => updateReview(5)}>5 Stars</button>
        </div>
      </section>

      <section>
        <h2>Counter (Callback Form)</h2>
        <p id="counter-value">Count: {counter.value.count}</p>
        {counter.processing && <p id="counter-processing">Processing...</p>}
        <button id="increment" onClick={incrementCounter}>Increment</button>
      </section>

      <section>
        <h2>Error Rollback</h2>
        <p id="error-value">Value: {errorTest.value.value}</p>
        {errorTest.processing && <p id="error-processing">Processing...</p>}
        <button id="trigger-error" onClick={triggerError}>Trigger Error</button>
      </section>

      <section>
        <h2>Cancel Rollback</h2>
        <p id="cancel-value">Value: {cancelTest.value.value}</p>
        {cancelTest.processing && <p id="cancel-processing">Processing...</p>}
        <button id="trigger-cancel" onClick={triggerCancel}>Start Slow Request</button>
        <button id="cancel-request" onClick={cancelRequest}>Cancel Request</button>
      </section>

      <section>
        <h2>Counters</h2>
        <p id="success-count">Success: {successCount}</p>
        <p id="error-count">Error: {errorCount}</p>
        <p id="cancel-count">Cancel: {cancelCount}</p>
      </section>

      <section>
        <button id="reset-all" onClick={resetAll}>Reset All</button>
      </section>
    </div>
  )
}
