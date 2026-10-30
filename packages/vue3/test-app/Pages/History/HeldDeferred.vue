<script setup lang="ts">
import { interceptors } from '@inertiajs/core'
import { Deferred, Link } from '@inertiajs/vue3'
import { onUnmounted } from 'vue'

const props = defineProps<{ page: string; comments?: string }>()

if (props.page === 'post') {
  const removeInterceptor = interceptors.onVisitResponse(async (visit, response) => {
    if (visit.deferredProps) {
      await new Promise<void>((resolve) => (window.releaseHeldResponse = resolve))
    }

    return response
  })

  onUnmounted(removeInterceptor)
}

const releaseHeldResponse = () => window.releaseHeldResponse?.()
</script>

<template>
  <div>This is the {{ page }} page.</div>

  <Link href="/history/held-deferred/post">Open the post</Link>
  <button @click="releaseHeldResponse">Release held response</button>

  <Deferred v-if="page === 'post'" data="comments">
    <template #fallback>
      <div>Loading comments...</div>
    </template>
    <div>{{ comments }}</div>
  </Deferred>
</template>
