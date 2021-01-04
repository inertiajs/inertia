<template>
  <div>
    <span class="text">This is the links page with plain object data</span>

    <inertia-link method="GET" href="/links-target/get" :data="{ foo: 'get' }" class="get">GET Link</inertia-link>
    <inertia-link method="POST" href="/links-target/post" :data="{ bar: 'post' }" class="post">POST Link</inertia-link>
    <inertia-link method="PUT" href="/links-target/put" :data="{ baz: 'put' }" class="put">PUT Link</inertia-link>
    <inertia-link method="PATCH" href="/links-target/patch" :data="{ foo: 'patch' }" class="patch">PATCH Link</inertia-link>
    <inertia-link method="DELETE" href="/links-target/delete" :data="{ bar: 'delete' }" class="delete">DELETE Link</inertia-link>
  </div>
</template>
