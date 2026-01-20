<script setup lang="ts">
export type User = {
  id: number
  name: string
}

defineProps<{
  user: User
}>()
</script>

<template>
  <div
    v-text="user.name"
    :data-user-id="user.id"
    :style="{
      height: '15vh',
      border: '1px solid #ccc',
      backgroundColor: `rgba(150,150,150,${user.id / 40})`,
      color: 'green',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }"
  />
</template>
