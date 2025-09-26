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
  <Head title="Photo Grid" />

  <InfiniteScroll
    data="photos"
    class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    :buffer="1000"
  >
    <Image v-for="photo in photos.data" :key="photo.id" :id="photo.id" :url="photo.url" />

    <template #loading>
      <div class="flex justify-center py-16">
        <Spinner class="size-6 text-gray-400" />
      </div>
    </template>
  </InfiniteScroll>
</template>
