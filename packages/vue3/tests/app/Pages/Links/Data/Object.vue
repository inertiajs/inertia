<template>
  <div>
    <span class="text">This is the links page that demonstrates passing data through plain objects</span>

    <inertia-link method="GET" href="/dump/get" :data="{ foo: 'get' }" class="get">GET Link</inertia-link>
    <inertia-link as="button" method="POST" href="/dump/post" :data="{ bar: 'post' }" class="post"
      >POST Link</inertia-link
    >
    <inertia-link as="button" method="PUT" href="/dump/put" :data="{ baz: 'put' }" class="put">PUT Link</inertia-link>
    <inertia-link as="button" method="PATCH" href="/dump/patch" :data="{ foo: 'patch' }" class="patch"
      >PATCH Link</inertia-link
    >
    <inertia-link as="button" method="DELETE" href="/dump/delete" :data="{ bar: 'delete' }" class="delete"
      >DELETE Link</inertia-link
    >

    <inertia-link href="/dump/get" :data="{ a: ['b', 'c'] }" class="qsaf-default">QSAF Defaults</inertia-link>
    <inertia-link href="/dump/get" :data="{ a: ['b', 'c'] }" queryStringArrayFormat="indices" class="qsaf-indices"
      >QSAF Indices</inertia-link
    >
    <inertia-link href="/dump/get" :data="{ a: ['b', 'c'] }" queryStringArrayFormat="brackets" class="qsaf-brackets"
      >QSAF Brackets</inertia-link
    >
  </div>
</template>
