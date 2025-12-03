<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ permissions: string; bar: string }>()
</script>

<template>
  <p id="permissions">Permissions: {{ permissions }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/custom-key/a">Go to Custom Key Page A</Link>
</template>
