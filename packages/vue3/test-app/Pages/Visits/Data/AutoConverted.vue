<script setup lang="ts">
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

    <a href="#" @click.prevent="visitMethod" class="visit">Visit Link</a>
    <a href="#" @click.prevent="postMethod" class="post">POST Link</a>
    <a href="#" @click.prevent="putMethod" class="put">PUT Link</a>
    <a href="#" @click.prevent="patchMethod" class="patch">PATCH Link</a>
    <a href="#" @click.prevent="deleteMethod" class="delete">DELETE Link</a>
  </div>
</template>
