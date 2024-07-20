<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { useHead } from 'unhead';
useHead({
    title: 'Login'
})
</script>

<template>
  <h1 class="text-3xl">Login</h1>
  <p class="mt-6">You made a <code>POST</code> request to the logout endpoint and were redirected to the login page.</p>
</template>
