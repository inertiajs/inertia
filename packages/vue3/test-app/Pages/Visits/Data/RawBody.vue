<script setup lang="ts">
import { http } from '@inertiajs/vue3'

declare global {
  interface Window {
    _raw_body_response?: any
  }
}

const send = async (data: unknown, headers?: Record<string, string>) => {
  const response = await http.getClient().request({
    method: 'post',
    url: '/api/raw-body',
    data,
    headers,
  })

  window._raw_body_response = JSON.parse(response.data)
}

const urlSearchParamsMethod = async () => {
  const params = new URLSearchParams()
  params.append('foo', 'bar')

  await send(params)
}

const stringMethod = async () => {
  await send('raw string contents', { 'Content-Type': 'text/plain' })
}

const blobMethod = async () => {
  const blob = new Blob(['raw blob contents'], { type: 'text/plain' })

  await send(blob)
}

const arrayBufferMethod = async () => {
  const buffer = new TextEncoder().encode('raw array buffer contents').buffer

  await send(buffer)
}

const arrayBufferViewMethod = async () => {
  const bytes = new TextEncoder().encode('raw array buffer view contents')

  await send(bytes)
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates HTTP client raw request bodies</span>

    <a href="#" @click.prevent="urlSearchParamsMethod" class="url-search-params">URLSearchParams Link</a>
    <a href="#" @click.prevent="stringMethod" class="string">String Link</a>
    <a href="#" @click.prevent="blobMethod" class="blob">Blob Link</a>
    <a href="#" @click.prevent="arrayBufferMethod" class="array-buffer">ArrayBuffer Link</a>
    <a href="#" @click.prevent="arrayBufferViewMethod" class="array-buffer-view">ArrayBufferView Link</a>
  </div>
</template>
