<script setup lang="ts">
import { inject } from 'vue'

const withAppValue = inject('withAppValue', 'not-injected')
</script>

<template>
  <div>
    <h1 data-testid="with-app-title">SSR WithApp</h1>
    <p data-testid="with-app-value">Value: {{ withAppValue }}</p>
  </div>
</template>
