<script setup>
import { Link } from '@inertiajs/vue3'

const alert = window.alert
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
    <Link href="/sleep" class="visit" @cancel="() => alert('cancelled')" @start="() => alert('started')">Link</Link>
  </div>
</template>
