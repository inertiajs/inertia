<script setup lang="ts">
import { Deferred, Link, router } from '@inertiajs/vue3'

const props = defineProps<{
  withOnly?: string[]
  withExcept?: string[]
  users?: Array<{ id: number; name: string }>
}>()

const handleTriggerPartialReload = () => {
  router.reload({
    only: props.withOnly,
    except: props.withExcept,
  })
}
</script>

<template>
  <div>
    <Deferred data="users">
      <template #fallback>
        <span>Loading...</span>
      </template>
      <template #default="{ reloading }">
        <span v-if="reloading" id="reloading-indicator">Reloading...</span>
        <span v-for="user in users" :key="user.id">{{ user.name }}</span>
      </template>
    </Deferred>
    <button @click="handleTriggerPartialReload">Trigger a partial reload</button>
    <Link href="/deferred-props/page-1" prefetch="hover">Prefetch</Link>
  </div>
</template>
