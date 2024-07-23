<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates passing data through plain objects</span>

    <Link method="GET" href="/dump/get" :data="{ foo: 'get' }" class="get">GET Link</Link>
    <Link as="button" method="POST" href="/dump/post" :data="{ bar: 'post' }" class="post">POST Link</Link>
    <Link as="button" method="PUT" href="/dump/put" :data="{ baz: 'put' }" class="put">PUT Link</Link>
    <Link as="button" method="PATCH" href="/dump/patch" :data="{ foo: 'patch' }" class="patch">PATCH Link</Link>
    <Link as="button" method="DELETE" href="/dump/delete" :data="{ bar: 'delete' }" class="delete">DELETE Link</Link>

    <Link href="/dump/get" :data="{ a: ['b', 'c'] }" class="qsaf-default">QSAF Defaults</Link>
    <Link href="/dump/get" :data="{ a: ['b', 'c'] }" queryStringArrayFormat="indices" class="qsaf-indices"
      >QSAF Indices</Link
    >
    <Link href="/dump/get" :data="{ a: ['b', 'c'] }" queryStringArrayFormat="brackets" class="qsaf-brackets"
      >QSAF Brackets</Link
    >
  </div>
</template>
