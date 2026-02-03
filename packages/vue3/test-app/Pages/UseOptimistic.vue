<script setup lang="ts">
import { useOptimistic } from '@inertiajs/vue3'
import { ref } from 'vue'

const successCount = ref(0)
const errorCount = ref(0)
const cancelCount = ref(0)

const feature = useOptimistic({ enabled: false })

const review = useOptimistic({ rating: 3, comment: '' })

const counter = useOptimistic({ count: 0 })

const errorTest = useOptimistic({ value: 'initial' })

const cancelTest = useOptimistic({ value: 'initial' })

const toggleFeature = () => {
  feature.patch('/api/optimistic/feature', (current) => ({ enabled: !current.enabled }), {
    onSuccess: () => successCount.value++,
    onError: () => errorCount.value++,
  })
}

const updateReview = (rating: number) => {
  review.patch('/api/optimistic/review', { rating }, {
    onSuccess: () => successCount.value++,
    onError: () => errorCount.value++,
  })
}

const incrementCounter = () => {
  counter.post('/api/optimistic/counter', (current) => ({ count: current.count + 1 }), {
    onSuccess: () => successCount.value++,
    onError: () => errorCount.value++,
  })
}

const triggerError = () => {
  errorTest.patch('/api/optimistic/error', { value: 'optimistic' }, {
    onSuccess: () => successCount.value++,
    onError: () => errorCount.value++,
  })
}

const triggerCancel = () => {
  cancelTest.patch('/api/optimistic/slow', { value: 'optimistic' }, {
    onSuccess: () => successCount.value++,
    onError: () => errorCount.value++,
    onCancel: () => cancelCount.value++,
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
  successCount.value = 0
  errorCount.value = 0
  cancelCount.value = 0
}
</script>

<template>
  <div>
    <h1>useOptimistic</h1>

    <section>
      <h2>Feature Toggle (Callback Form)</h2>
      <p id="feature-status">Feature: {{ feature.value.enabled ? 'Enabled' : 'Disabled' }}</p>
      <p id="feature-processing" v-if="feature.processing">Processing...</p>
      <button id="toggle-feature" @click="toggleFeature">Toggle Feature</button>
    </section>

    <section>
      <h2>Review Rating (Merge Form)</h2>
      <p id="review-rating">Rating: {{ review.value.rating }}</p>
      <p id="review-processing" v-if="review.processing">Processing...</p>
      <div>
        <button id="rate-1" @click="updateReview(1)">1 Star</button>
        <button id="rate-2" @click="updateReview(2)">2 Stars</button>
        <button id="rate-3" @click="updateReview(3)">3 Stars</button>
        <button id="rate-4" @click="updateReview(4)">4 Stars</button>
        <button id="rate-5" @click="updateReview(5)">5 Stars</button>
      </div>
    </section>

    <section>
      <h2>Counter (Callback Form)</h2>
      <p id="counter-value">Count: {{ counter.value.count }}</p>
      <p id="counter-processing" v-if="counter.processing">Processing...</p>
      <button id="increment" @click="incrementCounter">Increment</button>
    </section>

    <section>
      <h2>Error Rollback</h2>
      <p id="error-value">Value: {{ errorTest.value.value }}</p>
      <p id="error-processing" v-if="errorTest.processing">Processing...</p>
      <button id="trigger-error" @click="triggerError">Trigger Error</button>
    </section>

    <section>
      <h2>Cancel Rollback</h2>
      <p id="cancel-value">Value: {{ cancelTest.value.value }}</p>
      <p id="cancel-processing" v-if="cancelTest.processing">Processing...</p>
      <button id="trigger-cancel" @click="triggerCancel">Start Slow Request</button>
      <button id="cancel-request" @click="cancelRequest">Cancel Request</button>
    </section>

    <section>
      <h2>Counters</h2>
      <p id="success-count">Success: {{ successCount }}</p>
      <p id="error-count">Error: {{ errorCount }}</p>
      <p id="cancel-count">Cancel: {{ cancelCount }}</p>
    </section>

    <section>
      <button id="reset-all" @click="resetAll">Reset All</button>
    </section>
  </div>
</template>
