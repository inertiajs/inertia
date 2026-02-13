<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const defaultVisit = () => {
  router.post('/dump/post')
}

const basicVisit = () => {
  router.visit('/dump/post', {
    method: 'post',
    data: { foo: 'bar' },
    errorBag: 'visitErrorBag',
  })
}

const postVisit = () => {
  router.post(
    '/dump/post',
    {
      foo: 'baz',
    },
    {
      errorBag: 'postErrorBag',
    },
  )
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates error bags using manual visits</span>
    <a href="#" @click.prevent="defaultVisit" class="default">Default visit</a>
    <a href="#" @click.prevent="basicVisit" class="visit">Basic visit</a>
    <a href="#" @click.prevent="postVisit" class="get">POST visit</a>
  </div>
</template>
