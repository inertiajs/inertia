<script setup lang="ts">
import { Method } from '@inertiajs/core'
import { Link } from '@inertiajs/vue3'
import { ref } from 'vue'

const method = ref<Method>('get')
const href = ref('/dump/get')
const data = ref({ foo: 'bar' })
const headers = ref({ 'X-Custom-Header': 'value' })

const change = () => {
  method.value = 'post'
  href.value = '/dump/post'
  data.value = { foo: 'baz' }
  headers.value = { 'X-Custom-Header': 'new-value' }
}
</script>

<template>
  <div>
    <span class="text">
      This page demonstrates reactivity in Inertia links. Click the button to change the link properties.
    </span>

    <Link :method="method" :href="href" :data="data" :headers="headers">Submit</Link>
    <button @click="change">Change Link props</button>
  </div>
</template>
