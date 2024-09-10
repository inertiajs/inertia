<script setup>
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

    <a href="#" @click="standardVisitMethod" class="visit-get">Standard visit Link</a>
    <a href="#" @click="specificVisitMethod" class="visit-specific">Specific visit Link</a>
    <a href="#" @click="getMethod" class="get">GET Link</a>
    <a href="#" @click="postMethod" class="post">POST Link</a>
    <a href="#" @click="putMethod" class="put">PUT Link</a>
    <a href="#" @click="patchMethod" class="patch">PATCH Link</a>
    <a href="#" @click="deleteMethod" class="delete">DELETE Link</a>
  </div>
</template>
