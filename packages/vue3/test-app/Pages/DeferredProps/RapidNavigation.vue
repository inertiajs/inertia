<script setup lang="ts">
import { Deferred, Link, router } from '@inertiajs/vue3'

defineProps<{
  filter: string
  users?: { text: string }
  stats?: { text: string }
  activity?: { text: string }
}>()

const handleOnBeforeClick = () => {
  const shouldNavigate = confirm('Navigate away?')
  if (shouldNavigate) {
    router.visit('/deferred-props/page-2')
  }
}
</script>

<template>
  <div>Current filter: {{ filter }}</div>

  <Deferred data="users">
    <div>{{ users?.text }}</div>
    <template #fallback>
      <div>Loading users...</div>
    </template>
  </Deferred>

  <Deferred data="stats">
    <div>{{ stats?.text }}</div>
    <template #fallback>
      <div>Loading stats...</div>
    </template>
  </Deferred>

  <Deferred data="activity">
    <div>{{ activity?.text }}</div>
    <template #fallback>
      <div>Loading activity...</div>
    </template>
  </Deferred>

  <Link href="/deferred-props/rapid-navigation/a">Filter A</Link>
  <Link href="/deferred-props/rapid-navigation/b">Filter B</Link>
  <Link href="/deferred-props/rapid-navigation/c">Filter C</Link>
  <Link href="/deferred-props/page-1">Navigate Away</Link>

  <button @click="handleOnBeforeClick">Navigate with onBefore</button>
</template>
