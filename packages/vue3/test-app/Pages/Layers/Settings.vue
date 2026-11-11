<script setup lang="ts">
import { Link, setLayoutProps, useLayer } from '@inertiajs/vue3'

const layer = useLayer()

setLayoutProps({ layerChrome: 'layer' }, layer.id)
</script>

<template>
  <div>Account settings</div>
  <Link href="/layers/settings">Open settings again</Link>
</template>
