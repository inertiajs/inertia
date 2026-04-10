<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({ code: 'initial' })

const handleSetAndPost = () => {
  form.code = '123456'
  form.post('/dump/post')
}

const handleDirty = () => {
  form.code = 'dirty'
}

const handleResetAndPost = () => {
  form.reset()
  form.post('/dump/post')
}
</script>

<template>
  <div>
    <span id="current-code">{{ form.code }}</span>
    <button @click="handleSetAndPost" class="set-and-post">Set and POST</button>
    <button @click="handleDirty" class="dirty">Dirty</button>
    <button @click="handleResetAndPost" class="reset-and-post">Reset and POST</button>
  </div>
</template>
