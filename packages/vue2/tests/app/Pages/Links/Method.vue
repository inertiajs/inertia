<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-link methods</span>

    <inertia-link method="GET" href="/dump/get" class="get">GET Link</inertia-link>
    <inertia-link as="button" method="POST" href="/dump/post" class="post">POST Link</inertia-link>
    <inertia-link as="button" method="PUT" href="/dump/put" class="put">PUT Link</inertia-link>
    <inertia-link as="button" method="PATCH" href="/dump/patch" class="patch">PATCH Link</inertia-link>
    <inertia-link as="button" method="DELETE" href="/dump/delete" class="delete">DELETE Link</inertia-link>
  </div>
</template>
