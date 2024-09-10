<script setup>
import { router } from '@inertiajs/vue3'

const visitMethod = () => {
  const formData = new FormData()
  formData.append('foo', 'visit')

  router.visit('/dump/post', {
    method: 'post',
    data: formData,
  })
}

const postMethod = () => {
  const formData = new FormData()
  formData.append('baz', 'post')

  router.post('/dump/post', formData)
}

const putMethod = () => {
  const formData = new FormData()
  formData.append('foo', 'put')

  router.put('/dump/put', formData)
}

const patchMethod = () => {
  const formData = new FormData()
  formData.append('bar', 'patch')

  router.patch('/dump/patch', formData)
}

const deleteMethod = () => {
  const formData = new FormData()
  formData.append('baz', 'delete')

  router.delete('/dump/delete', {
    data: formData,
  })
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates manual visit data passing through FormData objects</span>

    <a href="#" @click="visitMethod" class="visit">Visit Link</a>
    <a href="#" @click="postMethod" class="post">POST Link</a>
    <a href="#" @click="putMethod" class="put">PUT Link</a>
    <a href="#" @click="patchMethod" class="patch">PATCH Link</a>
    <a href="#" @click="deleteMethod" class="delete">DELETE Link</a>
  </div>
</template>
