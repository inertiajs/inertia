<script setup>
import { router } from '@inertiajs/vue3'

const defaultHeadersMethod = () => {
  router.visit('/dump/get')
}

const visitWithCustomHeaders = () => {
  router.visit('/dump/get', {
    headers: {
      foo: 'bar',
    },
  })
}

const getMethod = () => {
  router.get(
    '/dump/get',
    {},
    {
      headers: {
        bar: 'baz',
      },
    },
  )
}

const postMethod = () => {
  router.post(
    '/dump/post',
    {},
    {
      headers: {
        baz: 'foo',
      },
    },
  )
}

const putMethod = () => {
  router.put(
    '/dump/put',
    {},
    {
      headers: {
        foo: 'bar',
      },
    },
  )
}

const patchMethod = () => {
  router.patch(
    '/dump/patch',
    {},
    {
      headers: {
        bar: 'baz',
      },
    },
  )
}

const deleteMethod = () => {
  router.delete('/dump/delete', {
    headers: {
      baz: 'foo',
    },
  })
}

const overridden = () => {
  router.post(
    '/dump/post',
    {},
    {
      headers: {
        bar: 'baz',
        'X-Requested-With': 'custom',
      },
    },
  )
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates passing custom headers through manual visits</span>

    <span @click="defaultHeadersMethod" class="default">Standard visit Link</span>

    <span @click="visitWithCustomHeaders" class="visit">Specific visit Link</span>
    <span @click="getMethod" class="get">GET Link</span>
    <span @click="postMethod" class="post">POST Link</span>
    <span @click="putMethod" class="put">PUT Link</span>
    <span @click="patchMethod" class="patch">PATCH Link</span>
    <span @click="deleteMethod" class="delete">DELETE Link</span>

    <span @click="overridden" class="overridden">DELETE Link</span>
  </div>
</template>
