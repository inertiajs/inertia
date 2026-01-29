<script setup lang="ts" generic="T extends Record<string, any>">
import { useForm } from '@inertiajs/vue3'

const props = defineProps<{ data: T }>()

const form = useForm(props.data)
</script>

<template>
  <form>
    <slot :form="form" />
  </form>
</template>
