<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-link methods</span>

    <Link method="get" href="/dump/get" class="get">GET Link</Link>
    <Link as="button" method="post" href="/dump/post" class="post">POST Link</Link>
    <Link as="button" method="put" href="/dump/put" class="put">PUT Link</Link>
    <Link as="button" method="patch" href="/dump/patch" class="patch">PATCH Link</Link>
    <Link as="button" method="delete" href="/dump/delete" class="delete">DELETE Link</Link>
  </div>
</template>
