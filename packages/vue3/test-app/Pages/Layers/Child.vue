<script setup lang="ts">
import { useLayer } from '@inertiajs/vue3'

const layer = useLayer()

const emitSaved = () => {
  layer.emit('saved', { id: 5 })
}

const closeSelf = () => {
  layer.close()
}
</script>

<template>
  <div>Child layer</div>
  <button @click="emitSaved">Emit saved</button>
  <button @click="closeSelf">Close myself</button>
</template>
