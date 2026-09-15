<script setup lang="ts">
// Increments in setup() (not onMounted) because the fallback can be unmounted
// in the same commit it's created in -- onMounted might never get the chance to fire.
if (typeof window !== 'undefined') {
  window._inertia_client_only_fallback_renders = (window._inertia_client_only_fallback_renders || 0) + 1
}
</script>

<template>
  <p data-testid="client-only-fallback">Loading widget...</p>
</template>
