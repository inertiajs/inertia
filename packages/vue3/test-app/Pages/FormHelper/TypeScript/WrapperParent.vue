<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import WrapperChild from './WrapperChild.vue'

const dummyForm = {
  header: '',
  children: [
    {
      title: '',
      active: false,
    },
  ],
}
</script>

<template>
  <WrapperChild :data="dummyForm" v-slot="{ form }">
    {{ form.children.map((child) => child.title) }}
  </WrapperChild>
</template>
