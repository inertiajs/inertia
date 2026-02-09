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

const updateUser = useHttp<{ name: string; email: string }, UserResponse>({
  name: '',
  email: '',
})

const lastPutResponse = ref<UserResponse | null>(null)
const lastPatchResponse = ref<UserResponse | null>(null)

const performPut = async () => {
  try {
    const result = await updateUser.put('/api/users/1')
    lastPutResponse.value = result
  } catch (e) {
    console.error('PUT failed:', e)
  }
}

const performPatch = async () => {
  try {
    const result = await updateUser.patch('/api/users/1')
    lastPatchResponse.value = result
  } catch (e) {
    console.error('PATCH failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp Methods Test</h1>

    <!-- PUT Request Test -->
    <section id="put-test">
      <h2>PUT Request</h2>
      <label>
        Name
        <input type="text" id="put-name" v-model="updateUser.name" />
      </label>
      <label>
        Email
        <input type="email" id="put-email" v-model="updateUser.email" />
      </label>
      <button @click="performPut" id="put-button">Update User (PUT)</button>
      <div v-if="updateUser.processing" id="put-processing">Updating...</div>
      <div v-if="lastPutResponse" id="put-result">
        PUT Success - ID: {{ lastPutResponse.id }}, Name: {{ lastPutResponse.user.name }}, Email:
        {{ lastPutResponse.user.email }}
      </div>
    </section>

    <!-- PATCH Request Test -->
    <section id="patch-test">
      <h2>PATCH Request</h2>
      <button @click="performPatch" id="patch-button">Update User (PATCH)</button>
      <div v-if="lastPatchResponse" id="patch-result">
        PATCH Success - ID: {{ lastPatchResponse.id }}, Name: {{ lastPatchResponse.user.name }}, Email:
        {{ lastPatchResponse.user.email }}
      </div>
    </section>
  </div>
</template>
