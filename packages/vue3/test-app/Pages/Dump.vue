<script setup lang="ts">
import { Method } from '@inertiajs/core'
import { usePage } from '@inertiajs/vue3'
import { onBeforeMount } from 'vue'
import type { MulterFile } from '../types'

const props = defineProps<{
  headers: Record<string, string>
  method: Method
  form: Record<string, any> | undefined
  files: MulterFile[] | object
  query: Record<string, any>
  url: string
}>()

const page = usePage()

const dump = {
  headers: props.headers,
  method: props.method,
  form: props.form,
  files: props.files ? props.files : {},
  query: props.query,
  url: props.url,
  $page: page,
}

onBeforeMount(() => {
  window._inertia_request_dump = dump
})
</script>

<template>
  <div>
    <div class="text">This is Inertia page component containing a data dump of the request</div>
    <hr />
    <pre class="dump">{{ dump }}</pre>
  </div>
</template>
