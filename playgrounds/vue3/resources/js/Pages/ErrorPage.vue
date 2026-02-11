<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

const props = defineProps<{
  status: number
}>()

const titles: Record<number, string> = {
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Server Error',
  503: 'Service Unavailable',
}

const descriptions: Record<number, string> = {
  403: 'You are not authorized to access this page.',
  404: 'The page you are looking for could not be found.',
  500: 'Something went wrong on our end.',
  503: 'We are currently performing maintenance. Please check back soon.',
}
</script>

<template>
  <Head :title="`${status} - ${titles[status]}`" />
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <h1 class="text-6xl font-bold text-slate-800">{{ status }}</h1>
    <h2 class="mt-2 text-xl text-slate-600">{{ titles[status] }}</h2>
    <p class="mt-4 text-slate-500">{{ descriptions[status] }}</p>
  </div>
</template>
