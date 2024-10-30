<script lang="ts">
import Layout from '../../Components/InfiniteScrollLayout.tsx'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, InfiniteScrollProp, Link } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps<{
  photos: InfiniteScrollProp<{
    id: number
    description: string
    color: string
    url: string
  }>
  category: string
  categories: Record<string, string>
}>()

const sortedPhotos = computed(() => {
  return props.photos.data.sort((a, b) => {
    return a.id - b.id
  })
})
</script>

<template>
  <Head title="Browse Photos" />
  <h1 class="text-3xl">Browse Photos</h1>
  <div class="flex">
    <div>
      <div class="sticky left-4 top-4 w-36 p-4 pl-0 pt-6">
        <h3 class="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Categories</h3>
        <ul>
          <li v-for="(name, value) in categories" :key="value">
            <Link
              :href="`/infinite-scroll/photos?category=${value}`"
              :class="{ 'font-bold': category === value }"
              class="text-sky-700"
            >
              {{ name }}
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <div class="mt-6 grid grid-cols-3 gap-4">
        <InfiniteScroll prop="photos" :buffer="200" trigger="both" :manual-after="4">
          <div v-for="photo in sortedPhotos" :key="photo.id" class="overflow-hidden rounded-lg shadow-lg">
            <div class="h-48 w-full">
              <img :src="photo.url" :alt="photo.description" class="h-full w-full object-cover" />
            </div>
            <div class="p-4">
              <div class="truncate text-gray-500">{{ photo.description }}</div>
            </div>
          </div>

          <template #manual="{ fetching, fetch, position }">
            <div class="col-span-3 mt-6 text-center">
              <button
                @click="fetch"
                :disabled="fetching"
                class="rounded bg-sky-700 px-4 py-2 text-white hover:bg-sky-800"
              >
                {{ fetching ? 'Loading...' : 'Load ' + (position === 'start' ? 'Previous' : 'More') }}
              </button>
            </div>
          </template>

          <template #fetching>
            <div class="col-span-3 mt-6 text-center">Fetching more photos...</div>
          </template>
        </InfiniteScroll>
      </div>
    </div>
  </div>
</template>

<!--
           -->
