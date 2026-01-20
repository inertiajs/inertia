<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref } from 'vue'

const title = ref('Initial Title')
const description = ref('Initial description')

function updateMeta() {
  title.value = 'Updated Title'
  description.value = 'Updated description'
}
</script>

<template>
  <Head :title="title">
    <meta name="description" :content="description" head-key="description" />
    <meta name="author" content="Test Author" />
  </Head>

  <div>
    <h1>Dynamic Head Updates</h1>
    <button id="update-meta" @click="updateMeta">Update Meta</button>
    <p>Current title: {{ title }}</p>
    <p>Current description: {{ description }}</p>
  </div>
</template>
