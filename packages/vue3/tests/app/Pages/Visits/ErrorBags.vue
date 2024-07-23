<script setup>
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
    <span @click="defaultVisit" class="default">Default visit</span>
    <span @click="basicVisit" class="visit">Basic visit</span>
    <span @click="postVisit" class="get">POST visit</span>
  </div>
</template>
