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
  <div class="flex h-[200px] w-full overflow-x-scroll">
    <InfiniteScroll data="photos" :buffer="1000" class="flex h-[200px] gap-6" only-next preserve-url>
      <Image v-for="photo in photos.data" :key="photo.id" :id="photo.id" :url="photo.url" />

      <template #loading>
        <div class="flex size-[200px] items-center justify-center">
          <Spinner class="size-6 text-gray-400" />
        </div>
      </template>
    </InfiniteScroll>
  </div>
</template>
