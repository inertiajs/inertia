<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface UserResponse {
  success: boolean
  id: number
  user: {
    name: string
    email: string
  }
}

// Form with Wayfinder endpoint
const form = useHttp<{ name: string; email: string }, UserResponse>('post', '/api/users', {
  name: '',
  email: '',
})

const submitResult = ref<UserResponse | null>(null)
const submitWithMethodResult = ref<UserResponse | null>(null)
const submitWithWayfinderResult = ref<UserResponse | null>(null)

const performSubmit = async () => {
  try {
    const result = await form.submit()
    submitResult.value = result
  } catch (e) {
    console.error('Submit failed:', e)
  }
}

const performSubmitWithMethod = async () => {
  try {
    const result = await form.submit('put', '/api/users/99')
    submitWithMethodResult.value = result
  } catch (e) {
    console.error('Submit with method failed:', e)
  }
}

const performSubmitWithWayfinder = async () => {
  try {
    const result = await form.submit({ method: 'patch', url: '/api/users/88' })
    submitWithWayfinderResult.value = result
  } catch (e) {
    console.error('Submit with wayfinder failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp Submit Test</h1>

    <label>
      Name
      <input type="text" id="submit-name" v-model="form.name" />
    </label>
    <label>
      Email
      <input type="email" id="submit-email" v-model="form.email" />
    </label>

    <!-- Submit using Wayfinder endpoint -->
    <section id="submit-test">
      <h2>Submit (uses Wayfinder endpoint)</h2>
      <button @click="performSubmit" id="submit-button">Submit</button>
      <div v-if="form.processing" id="submit-processing">Processing...</div>
      <div v-if="submitResult" id="submit-result">
        Submit Success - ID: {{ submitResult.id }}, Name: {{ submitResult.user.name }}, Email:
        {{ submitResult.user.email }}
      </div>
    </section>

    <!-- Submit with explicit method and URL -->
    <section id="submit-method-test">
      <h2>Submit with method and URL</h2>
      <button @click="performSubmitWithMethod" id="submit-method-button">Submit (PUT /api/users/99)</button>
      <div v-if="submitWithMethodResult" id="submit-method-result">
        PUT Success - ID: {{ submitWithMethodResult.id }}, Name: {{ submitWithMethodResult.user.name }}, Email:
        {{ submitWithMethodResult.user.email }}
      </div>
    </section>

    <!-- Submit with UrlMethodPair object -->
    <section id="submit-wayfinder-test">
      <h2>Submit with UrlMethodPair</h2>
      <button @click="performSubmitWithWayfinder" id="submit-wayfinder-button">
        Submit (PATCH /api/users/88)
      </button>
      <div v-if="submitWithWayfinderResult" id="submit-wayfinder-result">
        PATCH Success - ID: {{ submitWithWayfinderResult.id }}, Name: {{ submitWithWayfinderResult.user.name }}, Email:
        {{ submitWithWayfinderResult.user.email }}
      </div>
    </section>
  </div>
</template>
