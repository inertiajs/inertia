<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const standardVisitMethod = () => {
  router.visit('/dump/get')
}

const specificVisitMethod = () => {
  router.visit('/dump/patch', {
    method: 'patch',
  })
}

const getMethod = () => {
  router.get('/dump/get')
}

const postMethod = () => {
  router.post('/dump/post')
}

const putMethod = () => {
  router.put('/dump/put')
}

const patchMethod = () => {
  router.patch('/dump/patch')
}

const deleteMethod = () => {
  router.delete('/dump/delete')
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates manual visit methods</span>

    <a href="#" @click.prevent="standardVisitMethod" class="visit-get">Standard visit Link</a>
    <a href="#" @click.prevent="specificVisitMethod" class="visit-specific">Specific visit Link</a>
    <a href="#" @click.prevent="getMethod" class="get">GET Link</a>
    <a href="#" @click.prevent="postMethod" class="post">POST Link</a>
    <a href="#" @click.prevent="putMethod" class="put">PUT Link</a>
    <a href="#" @click.prevent="patchMethod" class="patch">PATCH Link</a>
    <a href="#" @click.prevent="deleteMethod" class="delete">DELETE Link</a>
  </div>
</template>
