<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

const form = useHttp<{ name: string }>({
  name: '',
})

const responseValue = ref<string>('none')

const performPost = async () => {
  try {
    const result = await form.post('/api/no-content')
    responseValue.value = JSON.stringify(result)
  } catch {
    responseValue.value = 'error'
  }
}
</script>

<template>
  <div>
    <h1>useHttp No Content Test</h1>

    <section id="no-content-test">
      <label>
        Name
        <input type="text" id="no-content-name" v-model="form.name" />
      </label>
      <button @click="performPost" id="no-content-button">Submit</button>
      <div v-if="form.processing" id="no-content-processing">Processing...</div>
      <div v-if="form.wasSuccessful" id="no-content-success">Success</div>
      <div id="no-content-response">Response: {{ responseValue }}</div>
    </section>
  </div>
</template>
