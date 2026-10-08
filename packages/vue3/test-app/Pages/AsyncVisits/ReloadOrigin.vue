<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

const reload = () => router.reload({ headers: { 'X-Repro-Delay': '1' } })
</script>

<template>
  <div>Page: Reload Origin</div>

  <button @click="reload">Reload</button>
  <Link href="/async-visits/page-c">Go to C</Link>
</template>
