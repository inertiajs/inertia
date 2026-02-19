<script setup lang="ts">
// This throws a generic error during component setup
// Will be classified as 'render' error type
throw new Error('Something went wrong during component initialization')
</script>

<template>
  <div>
    <h1>Render Error Example</h1>
    <p>This page should never render - it throws during setup.</p>
  </div>
</template>
