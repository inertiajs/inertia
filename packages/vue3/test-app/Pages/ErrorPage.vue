<script setup lang="ts">
defineProps({
  status: Number,
})
</script>

<template>
  <div>
    <h1>Error Page</h1>
    <p id="status">{{ status }}</p>
  </div>
</template>
