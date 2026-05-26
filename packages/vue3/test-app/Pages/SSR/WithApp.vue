<script setup lang="ts">
import { inject } from 'vue'

const withAppValue = inject('withAppValue', 'not-injected')
const withAppLocale = inject('withAppLocale', 'not-injected')
const withAppComponent = inject('withAppComponent', 'not-injected')
</script>

<template>
  <div>
    <h1 data-testid="with-app-title">SSR WithApp</h1>
    <p data-testid="with-app-value">Value: {{ withAppValue }}</p>
    <p data-testid="with-app-locale">Locale: {{ withAppLocale }}</p>
    <p data-testid="with-app-component">Component: {{ withAppComponent }}</p>
  </div>
</template>
