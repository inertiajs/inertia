<script setup lang="ts">
import type { VisitOptions } from '@inertiajs/core'
import { router } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()

const prefetch = (url: string) => router.prefetch(url, { method: 'get' }, {})
const instantVisit = (url: string, options: VisitOptions = {}) =>
  router.visit(url, { component: 'OnceProps/InstantPageB', ...options })
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>

  <button @click="prefetch('/once-props/instant/b')">Prefetch Page B</button>
  <button @click="instantVisit('/once-props/instant/b')">Instant visit to Page B</button>

  <button @click="prefetch('/once-props/instant/b?deferred=1')">Prefetch Deferred Page B</button>
  <button @click="instantVisit('/once-props/instant/b?deferred=1')">Instant visit to Deferred Page B</button>

  <button @click="prefetch('/once-props/instant/b?shared=1')">Prefetch Shared Page B</button>
  <button @click="instantVisit('/once-props/instant/b?shared=1')">Instant visit to Shared Page B</button>
  <button @click="instantVisit('/once-props/instant/b?shared=1', { pageProps: (props, sharedProps) => sharedProps })">
    Instant visit to Shared Page B with shared page props
  </button>

  <button @click="instantVisit('/once-props/instant/b', { pageProps: { foo: 'foo-provided' } })">
    Instant visit with provided foo
  </button>
</template>
