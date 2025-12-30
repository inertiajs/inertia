<script setup lang="ts">
function navigate() {
  window.history.replaceState({ foo: {} }, '')
  window.location.href = '/non-inertia'
}
</script>

<template>
  <div>
    <h1>Navigate Non-Inertia</h1>
    <p>
      <a href="/non-inertia" @click.prevent="navigate">Go to non-Inertia page</a>
    </p>
  </div>
</template>
