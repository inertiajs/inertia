<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Head with fragment">
    <meta name="before-fragment" content="before" />
    <template v-if="true">
      <meta name="in-fragment-a" content="a" />
      <meta name="in-fragment-b" content="b" />
    </template>
    <meta name="after-fragment" content="after" />
  </Head>
  <div>
    <p>Head fragment test</p>
  </div>
</template>
