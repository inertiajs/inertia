<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head>
    <!-- Head with no title prop -->
    <meta name="test" content="no title provided" />
  </Head>

  <div>
    <h1>Head without Title Prop</h1>
    <p>Tests that Head works without a title prop</p>
  </div>
</template>
