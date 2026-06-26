<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

const draft = ref('')

const backgroundReload = () => {
  router.reload({
    data: { foo: 'bar' },
    headers: { 'X-Simulate-Version-Change': '1' },
  })
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates async location visits</span>

    <input id="draft" v-model="draft" />

    <button @click="backgroundReload" class="reload">Background reload</button>
  </div>
</template>
