<script setup lang="ts">
import { config, Head } from '@inertiajs/vue3'

config.set('future.useDataInertiaHeadAttribute', true)
</script>

<template>
  <Head title="Test Head Component">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </Head>

  <h1 :style="{ fontSize: '40px' }">Head Component</h1>
</template>
