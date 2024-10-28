<script lang="ts">
import Layout from '../../Components/InfiniteScrollLayout.vue'
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
      <div class="sticky p-4 pt-6 pl-0 left-4 top-4 w-36">
        <h3 class="pb-1 mb-2 text-sm font-bold uppercase border-b border-gray-300">Categories</h3>
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
      <div class="grid grid-cols-3 gap-4 mt-6">
        <InfiniteScroll trigger="both" prop="photos" :buffer="200">
          <div v-for="photo in sortedPhotos" :key="photo.id" class="overflow-hidden rounded-lg shadow-lg">
            <div class="w-full h-48">
              <img :src="photo.url" :alt="photo.description" class="object-cover w-full h-full" />
            </div>
            <div class="p-4">
              <div class="text-gray-500 truncate">{{ photo.description }}</div>
            </div>
          </div>

          <template #manual="{ fetching, fetch, position }">
            <div class="col-span-3 mt-6 text-center">
              <button
                @click="fetch"
                :disabled="fetching"
                class="px-4 py-2 text-white rounded bg-sky-700 hover:bg-sky-800"
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
