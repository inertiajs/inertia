<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

const linkData = ref(new FormData())

onMounted(() => {
  linkData.value.append('bar', 'baz')
})
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates passing data through FormData objects</span>

    <Link method="get" href="/dump/get" :data="linkData" class="get">GET Link</Link>
    <Link as="button" method="post" href="/dump/post" :data="linkData" class="post">POST Link</Link>
    <Link as="button" method="put" href="/dump/put" :data="linkData" class="put">PUT Link</Link>
    <Link as="button" method="patch" href="/dump/patch" :data="linkData" class="patch">PATCH Link</Link>
    <Link as="button" method="delete" href="/dump/delete" :data="linkData" class="delete">DELETE Link</Link>
  </div>
</template>
