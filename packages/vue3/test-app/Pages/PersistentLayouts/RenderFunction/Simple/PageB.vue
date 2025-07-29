<script lang="ts">
import type { Component } from 'vue'
import Layout from '@/Layouts/SiteLayout.vue'

export default {
  layout: (h: Function, page: Component) => h(Layout, [page]),
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/render-function/simple/page-a">Page A</Link>
  </div>
</template>
