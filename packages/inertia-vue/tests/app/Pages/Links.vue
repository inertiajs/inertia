<template>
  <div>
    <span>This is the root Links page</span>
    <inertia-link href="/links-target/get" class="basic">Basic visit Link</inertia-link>

    <inertia-link method="GET" href="/links-target/get" class="get">GET Link</inertia-link>
    <inertia-link method="POST" href="/links-target/post" class="post">POST Link</inertia-link>
    <inertia-link method="PUT" href="/links-target/put" class="put">PUT Link</inertia-link>
    <inertia-link method="PATCH" href="/links-target/patch" class="patch">PATCH Link</inertia-link>
    <inertia-link method="DELETE" href="/links-target/delete" class="delete">DELETE Link</inertia-link>
  </div>
</template>
