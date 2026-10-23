<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ title: string; token?: string }>()
</script>

<template>
  <Link href="/encrypted-history/public">Public page</Link>
  <Link href="/encrypted-history/private">Private page</Link>
  <Link href="/encrypted-history/logout">Log out</Link>

  <h1>{{ title }}</h1>

  <div v-if="token">
    Token: <span id="token">{{ token }}</span>
  </div>
</template>
