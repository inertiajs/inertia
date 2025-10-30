<script setup lang="ts">
import { VisitOptions } from '@inertiajs/core'
import { config, Link, useForm, usePage } from '@inertiajs/vue3'

const page = usePage()
const form = useForm({})

const submit = () => {
  form.post(page.url)
}

config.set({
  'form.recentlySuccessfulDuration': 1000,
  'prefetch.cacheFor': '2s',
})

config.set('visitOptions', (href: string, options: VisitOptions) => {
  if (href !== '/dump/post') {
    return {}
  }

  return { headers: { ...options.headers, 'X-From-Callback': 'bar' } }
})
</script>

<template>
  <Link prefetch href="/dump/get">Prefetch Link</Link>
  <Link method="post" :headers="{ 'X-From-Link': 'foo' }" href="/dump/post">Post Dump</Link>
  <button @click="submit">Submit Form</button>
  <p v-if="form.recentlySuccessful">Form was recently successful!</p>
</template>
