<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Test Head Component">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content='This is an "escape" example' />
    <meta name="number" :content="0" />
    <meta name="boolean" :content="true" />
    <meta name="false" :content="false" />
    <meta name="null" :content="null" />
    <meta name="undefined" :content="undefined" />
    <meta name="float" :content="3.14" />
  </Head>

  <h1 :style="{ fontSize: '40px' }">Head Component</h1>
</template>
