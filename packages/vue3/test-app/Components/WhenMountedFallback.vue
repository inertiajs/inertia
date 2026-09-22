<script setup lang="ts">
import { counts } from './whenMountedCounts'

// Counts in setup, not onMounted, since the fallback can unmount in the same commit
counts.fallbackRenders++
</script>

<template>
  <p id="when-mounted-fallback">Loading widget...</p>
</template>
