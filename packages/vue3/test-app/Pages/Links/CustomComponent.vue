<template>
  <div>
    <h1>Custom Component Link Test</h1>
    
    <p>Regular link as button:</p>
    <Link href="/dump/get" as="button">
      Regular Button
    </Link>
    
    <p>Custom component link:</p>
    <Link href="/dump/get" :as="PrimaryButton">
      Custom Button
    </Link>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'
import PrimaryButton from './PrimaryButton.vue'
</script>