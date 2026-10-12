<script setup lang="ts">
import { useRemember } from '@inertiajs/vue3'

const notes = useRemember({ text: '' }, 'Users/Notes')
</script>

<template>
  <label>
    Notes
    <input type="text" v-model="notes.text" />
  </label>
</template>
