<script setup lang="ts">
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

    <a href="#" @click.prevent="defaultHeadersMethod" class="default">Standard visit Link</a>

    <a href="#" @click.prevent="visitWithCustomHeaders" class="visit">Specific visit Link</a>
    <a href="#" @click.prevent="getMethod" class="get">GET Link</a>
    <a href="#" @click.prevent="postMethod" class="post">POST Link</a>
    <a href="#" @click.prevent="putMethod" class="put">PUT Link</a>
    <a href="#" @click.prevent="patchMethod" class="patch">PATCH Link</a>
    <a href="#" @click.prevent="deleteMethod" class="delete">DELETE Link</a>

    <a href="#" @click.prevent="overridden" class="overridden">Overriden Link</a>
  </div>
</template>
