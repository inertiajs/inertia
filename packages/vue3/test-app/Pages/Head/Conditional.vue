<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref } from 'vue'

const showDescription = ref(true)
const showKeywords = ref(false)

function toggleDescription() {
  showDescription.value = !showDescription.value
}

function toggleKeywords() {
  showKeywords.value = !showKeywords.value
}
</script>

<template>
  <Head title="Conditional Rendering">
    <meta
      v-if="showDescription"
      name="description"
      content="This description is conditionally rendered"
      head-key="description"
    />
    <meta v-if="showKeywords" name="keywords" content="vue, test, conditional" head-key="keywords" />
    <meta name="always-present" content="This is always here" />
  </Head>

  <div>
    <h1>Conditional Head Rendering</h1>
    <button id="toggle-description" @click="toggleDescription">
      {{ showDescription ? 'Hide' : 'Show' }} Description
    </button>
    <button id="toggle-keywords" @click="toggleKeywords">{{ showKeywords ? 'Hide' : 'Show' }} Keywords</button>
    <p>Description visible: {{ showDescription }}</p>
    <p>Keywords visible: {{ showKeywords }}</p>
  </div>
</template>
