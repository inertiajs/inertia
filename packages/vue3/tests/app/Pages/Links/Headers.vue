<template>
  <div>
    <span class="text">This is the links page that demonstrates passing custom headers</span>
    <inertia-link href="/dump/get" class="default">Standard visit Link</inertia-link>

    <inertia-link method="GET" href="/dump/get" :headers="{ foo: 'bar' }" class="custom">GET Link</inertia-link>
    <inertia-link
      as="button"
      method="POST"
      href="/dump/post"
      :headers="{ bar: 'baz', 'X-Requested-With': 'custom' }"
      class="overridden"
      >POST Link</inertia-link
    >
  </div>
</template>
