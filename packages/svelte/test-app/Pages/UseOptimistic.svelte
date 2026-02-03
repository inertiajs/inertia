<script>
  import { useOptimistic } from '@inertiajs/svelte'

  let successCount = 0
  let errorCount = 0
  let cancelCount = 0

  const feature = useOptimistic({ enabled: false })
  const review = useOptimistic({ rating: 3, comment: '' })
  const counter = useOptimistic({ count: 0 })
  const errorTest = useOptimistic({ value: 'initial' })
  const cancelTest = useOptimistic({ value: 'initial' })

  const toggleFeature = () => {
    feature.patch('/api/optimistic/feature', (current) => ({ enabled: !current.enabled }), {
      onSuccess: () => successCount++,
      onError: () => errorCount++,
    })
  }

  const updateReview = (rating) => {
    review.patch('/api/optimistic/review', { rating }, {
      onSuccess: () => successCount++,
      onError: () => errorCount++,
    })
  }

  const incrementCounter = () => {
    counter.post('/api/optimistic/counter', (current) => ({ count: current.count + 1 }), {
      onSuccess: () => successCount++,
      onError: () => errorCount++,
    })
  }

  const triggerError = () => {
    errorTest.patch('/api/optimistic/error', { value: 'optimistic' }, {
      onSuccess: () => successCount++,
      onError: () => errorCount++,
    })
  }

  const triggerCancel = () => {
    cancelTest.patch('/api/optimistic/slow', { value: 'optimistic' }, {
      onSuccess: () => successCount++,
      onError: () => errorCount++,
      onCancel: () => cancelCount++,
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
    successCount = 0
    errorCount = 0
    cancelCount = 0
  }
</script>

<div>
  <h1>useOptimistic</h1>

  <section>
    <h2>Feature Toggle (Callback Form)</h2>
    <p id="feature-status">Feature: {feature.value.enabled ? 'Enabled' : 'Disabled'}</p>
    {#if feature.processing}
      <p id="feature-processing">Processing...</p>
    {/if}
    <button id="toggle-feature" on:click={toggleFeature}>Toggle Feature</button>
  </section>

  <section>
    <h2>Review Rating (Merge Form)</h2>
    <p id="review-rating">Rating: {review.value.rating}</p>
    {#if review.processing}
      <p id="review-processing">Processing...</p>
    {/if}
    <div>
      <button id="rate-1" on:click={() => updateReview(1)}>1 Star</button>
      <button id="rate-2" on:click={() => updateReview(2)}>2 Stars</button>
      <button id="rate-3" on:click={() => updateReview(3)}>3 Stars</button>
      <button id="rate-4" on:click={() => updateReview(4)}>4 Stars</button>
      <button id="rate-5" on:click={() => updateReview(5)}>5 Stars</button>
    </div>
  </section>

  <section>
    <h2>Counter (Callback Form)</h2>
    <p id="counter-value">Count: {counter.value.count}</p>
    {#if counter.processing}
      <p id="counter-processing">Processing...</p>
    {/if}
    <button id="increment" on:click={incrementCounter}>Increment</button>
  </section>

  <section>
    <h2>Error Rollback</h2>
    <p id="error-value">Value: {errorTest.value.value}</p>
    {#if errorTest.processing}
      <p id="error-processing">Processing...</p>
    {/if}
    <button id="trigger-error" on:click={triggerError}>Trigger Error</button>
  </section>

  <section>
    <h2>Cancel Rollback</h2>
    <p id="cancel-value">Value: {cancelTest.value.value}</p>
    {#if cancelTest.processing}
      <p id="cancel-processing">Processing...</p>
    {/if}
    <button id="trigger-cancel" on:click={triggerCancel}>Start Slow Request</button>
    <button id="cancel-request" on:click={cancelRequest}>Cancel Request</button>
  </section>

  <section>
    <h2>Counters</h2>
    <p id="success-count">Success: {successCount}</p>
    <p id="error-count">Error: {errorCount}</p>
    <p id="cancel-count">Cancel: {cancelCount}</p>
  </section>

  <section>
    <button id="reset-all" on:click={resetAll}>Reset All</button>
  </section>
</div>
