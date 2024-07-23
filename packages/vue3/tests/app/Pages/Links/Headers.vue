<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates passing custom headers</span>
    <Link href="/dump/get" class="default">Standard visit Link</Link>

    <Link method="get" href="/dump/get" :headers="{ foo: 'bar' }" class="custom">GET Link</Link>
    <Link
      as="button"
      method="post"
      href="/dump/post"
      :headers="{ bar: 'baz', 'X-Requested-With': 'custom' }"
      class="overridden"
      >POST Link</Link
    >
  </div>
</template>
