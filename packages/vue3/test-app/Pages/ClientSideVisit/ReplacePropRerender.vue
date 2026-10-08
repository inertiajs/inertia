<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import ReplacePropRerenderChild from './ReplacePropRerenderChild.vue'

defineProps<{
  user: { name: string }
  other: { label: string }
  profile: { name: string; avatar: { label: string } }
}>()
</script>

<template>
  <div>
    <h1>replaceProp Identity Test</h1>
    <div id="current-value">Current value: {{ user.name }}</div>
    <div id="profile-name">Profile name: {{ profile.name }}</div>

    <ReplacePropRerenderChild prefix="memo" :item="other" />
    <ReplacePropRerenderChild prefix="avatar" :item="profile.avatar" />

    <button @click="router.replaceProp('user.name', 'Jane Smith')">Replace user.name</button>
    <button @click="router.replaceProp('profile.name', 'Jane Smith')">Replace profile.name</button>
  </div>
</template>
