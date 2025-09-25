<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll } from '@inertiajs/vue3'
import Image from '../Components/Image.vue'
import Spinner from '../Components/Spinner.vue'

defineProps<{
  photos: {
    data: {
      id: number
      url: string
    }[]
  }
}>()
</script>

<template>
  <Head title="Photo Grid (Horizontal)" />
  <div class="flex h-[200px] w-screen overflow-x-scroll">
    <InfiniteScroll data="photos" :buffer="1000" class="flex h-[200px] gap-6">
      <Image v-for="photo in photos.data" :key="photo.id" :id="photo.id" :url="photo.url" />

      <template #loading="{ loadingPrevious }">
        <div class="flex justify-center" :class="loadingPrevious ? 'py-16' : 'py-16'">
          <Spinner class="size-6 text-gray-400" />
        </div>
      </template>
    </InfiniteScroll>
  </div>
</template>
