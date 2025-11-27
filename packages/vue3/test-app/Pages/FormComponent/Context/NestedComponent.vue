<script setup lang="ts">
import DeeplyNestedComponent from './DeeplyNestedComponent.vue'
</script>

<template>
  <div id="nested-component" style="border: 2px solid green; padding: 10px; margin: 10px 0">
    <h3>Nested Component (wrapper, no context usage)</h3>
    <p>This component doesn't use the context, but passes it down to a deeply nested child.</p>

    <!-- Even deeper nested component -->
    <DeeplyNestedComponent />
  </div>
</template>
