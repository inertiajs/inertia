<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
    <Link href="/sleep" class="visit" @cancel="() => console.log('cancelled')" @start="() => console.log('started')"
      >Link</Link
    >
  </div>
</template>
