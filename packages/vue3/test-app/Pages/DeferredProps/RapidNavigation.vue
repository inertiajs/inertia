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

  <button @click="router.reload({ except: ['stats'] })">Reload with except</button>

  <button @click="router.visit('/deferred-props/rapid-navigation/b', { only: ['users'] })">Visit B with only</button>

  <button @click="router.visit(`/deferred-props/rapid-navigation/${filter}`)">Re-visit same URL</button>

  <button @click="router.reload()">Plain reload</button>

  <button @click="router.reload({ only: ['users'], except: ['stats'] })">Reload with only and except</button>

  <button @click="router.visit('/deferred-props/rapid-navigation/b', { except: ['stats'] })">
    Visit B with except
  </button>

  <button @click="router.visit('/deferred-props/rapid-navigation/b', { only: ['users'], except: ['stats'] })">
    Visit B with only and except
  </button>

  <button @click="router.prefetch('/deferred-props/rapid-navigation/b')">Prefetch Filter B</button>

  <button @click="router.prefetch('/deferred-props/page-1')">Prefetch Page 1</button>
</template>
