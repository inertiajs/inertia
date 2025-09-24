<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll } from '@inertiajs/vue3'
import { reactive } from 'vue'
import Spinner from '../Components/Spinner.vue'

defineProps<{
  photos: {
    data: {
      id: number
      url: string
    }[]
  }
}>()

/**
 * Track per-photo load and error state.
 * Using a plain reactive record so we can set properties like loaded[photo.id] = true
 * without fighting Set reactivity.
 */
const loaded: Record<number, boolean> = reactive({})

function handleLoad(id: number) {
  loaded[id] = true
}
</script>

<template>
  <Head title="Photo Grid" />
  <div class="flex h-[200px] w-screen overflow-x-scroll">
    <InfiniteScroll data="photos" :buffer="1000" class="flex h-[200px] gap-6">
      <div
        v-for="photo in photos.data"
        :key="photo.id"
        class="relative aspect-square overflow-hidden rounded-lg bg-gray-200"
      >
        <div v-if="!loaded[photo.id]" class="absolute inset-0 animate-pulse bg-gray-300" aria-hidden="true" />

        <img
          :src="photo.url"
          :alt="`Photo ${photo.id}`"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          class="h-full w-full object-cover transition duration-500 ease-out"
          :class="{
            'scale-100 opacity-100 blur-0': loaded[photo.id],
            'scale-105 opacity-0 blur-sm': !loaded[photo.id],
          }"
          @load="handleLoad(photo.id)"
        />

        <span class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
          {{ photo.id }}
        </span>
      </div>

      <template #loading="{ loadingPrevious }">
        <div class="flex justify-center" :class="loadingPrevious ? 'py-16' : 'py-16'">
          <Spinner class="size-6 text-gray-400" />
        </div>
      </template>
    </InfiniteScroll>
  </div>
</template>
