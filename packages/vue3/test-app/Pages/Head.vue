<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Test Head Component">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content='This is an "escape" example' />
    <meta name="undefined" :content="undefined" />
    <!-- @vue-expect-error The conetent attribute must be a string -->
    <meta name="number" :content="0" />
    <!-- @vue-expect-error -->
    <meta name="boolean" :content="true" />
    <!-- @vue-expect-error -->
    <meta name="false" :content="false" />
    <!-- @vue-expect-error -->
    <meta name="null" :content="null" />
    <!-- @vue-expect-error -->
    <meta name="float" :content="3.14" />
  </Head>

  <h1 :style="{ fontSize: '40px' }">Head Component</h1>
</template>
