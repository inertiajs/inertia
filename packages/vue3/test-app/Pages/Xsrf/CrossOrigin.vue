<script setup lang="ts">
import { Link, useHttp } from '@inertiajs/vue3'

const upload = useHttp({})
</script>

<template>
  <div>
    <Link as="button" method="post" href="/dump/post">Same-origin Link</Link>
    <Link as="button" method="post" href="https://external.example/upload">Cross-origin Link</Link>
    <button @click="upload.put('https://external.example/upload')">Cross-origin HTTP</button>
  </div>
</template>
