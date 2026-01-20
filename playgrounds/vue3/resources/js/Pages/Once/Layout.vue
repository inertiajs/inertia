<script setup lang="ts">
import Layout from '../../Components/Layout.vue'

import { Link } from '@inertiajs/vue3'
</script>

<template>
  <Layout>
    <slot />
    <Link href="/once/1" class="text-blue-500 underline"> Go to First Page </Link>
    <Link href="/once/2" class="ml-4 text-blue-500 underline"> Go to Second Page </Link>
    <Link href="/once/3" class="ml-4 text-blue-500 underline"> Go to Third Page </Link>
    <Link href="/once/4" class="ml-4 text-blue-500 underline" prefetch="mount"> Go to Fourth Page </Link>
    <button @click="$inertia.reload({ only: ['foo'] })" class="ml-4 text-blue-500 underline">Reload Foo</button>
    <button @click="$inertia.reload({ only: ['bar'] })" class="ml-4 text-blue-500 underline">Reload Bar</button>
    <button @click="$inertia.reload({ only: ['baz1', 'baz2', 'baz3', 'baz4'] })" class="ml-4 text-blue-500 underline">
      Reload Baz
    </button>
    <button @click="$inertia.reload({ only: ['qux'] })" class="ml-4 text-blue-500 underline">Reload Qux</button>
  </Layout>
</template>
