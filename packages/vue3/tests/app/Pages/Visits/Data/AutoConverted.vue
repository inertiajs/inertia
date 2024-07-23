<script setup>
import { router } from '@inertiajs/vue3'

const formData = {
  file: new File([], 'example.jpg'),
  foo: 'bar',
}

const visitMethod = () => {
  router.visit('/dump/post', {
    method: 'post',
    data: formData,
  })
}

const postMethod = () => {
  router.post('/dump/post', formData)
}

const putMethod = () => {
  router.put('/dump/put', formData)
}

const patchMethod = () => {
  router.patch('/dump/patch', formData)
}

const deleteMethod = () => {
  router.delete('/dump/delete', {
    data: formData,
  })
}
</script>

<template>
  <div>
    <span class="text"
      >This is the page that demonstrates automatic conversion of plain objects to form-data using manual visits</span
    >

    <span @click="visitMethod" class="visit">Visit Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>
  </div>
</template>
