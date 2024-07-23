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

    <span @click="standardVisitMethod" class="visit-get">Standard visit Link</span>
    <span @click="specificVisitMethod" class="visit-specific">Specific visit Link</span>
    <span @click="getMethod" class="get">GET Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>
  </div>
</template>
