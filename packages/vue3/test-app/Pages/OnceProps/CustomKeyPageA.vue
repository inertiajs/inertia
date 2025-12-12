<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ userPermissions: string; bar: string }>()
</script>

<template>
  <p id="permissions">Permissions: {{ userPermissions }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/custom-key/b">Go to Custom Key Page B</Link>
</template>
