<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'

interface Props {
  randomValue: number
}

defineProps<Props>()

const form = useForm({})

const submitToSame = () => {
  form.post('/prefetch/form')
}

const submitToOther = () => {
  form.post('/prefetch/redirect-back')
}
</script>

<template>
  <div>
    <p>
      Random Value: <span class="random-value">{{ randomValue }}</span>
    </p>
    <button @click="submitToSame">Submit to Same URL</button>
    <button @click="submitToOther">Submit to Other URL</button>
    <Link href="/prefetch/test-page">Back to Test Page</Link>
  </div>
</template>
