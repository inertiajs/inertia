<script setup>
import { router } from '@inertiajs/vue3'

const visitMethod = () => {
  router.visit('/dump/get', {
    data: { foo: 'visit' },
  })
}

const getMethod = () => {
  router.get('/dump/get', {
    bar: 'get',
  })
}

const postMethod = () => {
  router.post('/dump/post', {
    baz: 'post',
  })
}

const putMethod = () => {
  router.put('/dump/put', {
    foo: 'put',
  })
}

const patchMethod = () => {
  router.patch('/dump/patch', {
    bar: 'patch',
  })
}

const deleteMethod = () => {
  router.delete('/dump/delete', {
    data: { baz: 'delete' },
  })
}

const qsafDefault = () => {
  router.visit('/dump/get', {
    data: { a: ['b', 'c'] },
  })
}

const qsafIndices = () => {
  router.visit('/dump/get', {
    data: { a: ['b', 'c'] },
    queryStringArrayFormat: 'indices',
  })
}

const qsafBrackets = () => {
  router.visit('/dump/get', {
    data: { a: ['b', 'c'] },
    queryStringArrayFormat: 'brackets',
  })
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates manual visit data passing through plain objects</span>

    <span @click="visitMethod" class="visit">Visit Link</span>
    <span @click="getMethod" class="get">GET Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>

    <span @click="qsafDefault" class="qsaf-default">QSAF Defaults</span>
    <span @click="qsafIndices" class="qsaf-indices">QSAF Indices</span>
    <span @click="qsafBrackets" class="qsaf-brackets">QSAF Brackets</span>
  </div>
</template>
