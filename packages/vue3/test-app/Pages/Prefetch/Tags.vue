<script setup>
import { Link, router, useForm } from '@inertiajs/vue3'

defineProps({
  pageNumber: String,
  lastLoaded: Number,
})

const form = useForm({
  name: '',
})

const flushUserTags = () => {
  router.flushByTags(['user'])
}

const flushUserProductTags = () => {
  router.flushByTags(['user', 'product'])
}

const programmaticPrefetch = () => {
  router.prefetch('/prefetch/tags/2', { method: 'get' }, { tags: ['user'] })
  router.prefetch('/prefetch/tags/3', { method: 'get' }, { cacheFor: '1m', tags: ['product'] })
  router.prefetch(
    '/prefetch/tags/6',
    { method: 'get' },
    { cacheFor: '1m' }, // No tags (untagged)
  )
}

const submitWithUserInvalidation = () => {
  form.post('/dump/post', {
    invalidate: ['user'],
  })
}
</script>

<template>
  <div>
    <div id="links">
      <Link href="/prefetch/tags/1" prefetch="hover" :tags="['user', 'profile']"> User Page 1 </Link>
      <Link href="/prefetch/tags/2" prefetch="hover" :tags="['user', 'settings']"> User Page 2 </Link>
      <Link href="/prefetch/tags/3" prefetch="hover" :tags="['product', 'catalog']"> Product Page 3 </Link>
      <Link href="/prefetch/tags/4" prefetch="hover" :tags="['product', 'details']"> Product Page 4 </Link>
      <Link href="/prefetch/tags/5" prefetch="hover" :tags="['admin']"> Admin Page 5 </Link>
      <Link href="/prefetch/tags/6" prefetch="hover"> Untagged Page 6 </Link>
    </div>
    <div id="controls">
      <button id="flush-user" @click="flushUserTags">Flush User Tags</button>
      <button id="flush-user-product" @click="flushUserProductTags">Flush User + Product Tags</button>
      <button id="programmatic-prefetch" @click="programmaticPrefetch">Programmatic Prefetch</button>
    </div>

    <div id="form-section">
      <h3>Form Test</h3>
      <form @submit.prevent>
        <input id="form-name" v-model="form.name" type="text" placeholder="Enter name" />
        <button id="submit-invalidate-user" @click="submitWithUserInvalidation">Submit (Invalidate User)</button>
      </form>
    </div>
    <div>
      <div>This is tags page {{ pageNumber }}</div>
      <div>
        Last loaded at <span id="last-loaded">{{ lastLoaded }}</span>
      </div>
    </div>
  </div>
</template>
