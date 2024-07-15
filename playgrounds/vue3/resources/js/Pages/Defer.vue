<script lang="ts">
import Deferred from '../../../../../packages/vue3/src/Deferred.vue'
import Layout from '../Components/Layout.vue'
import TestGrid from '../Components/TestGrid.vue'
import TestGridItem from '../Components/TestGridItem.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

defineProps<{
  users?: {
    id: number
    name: string
    email: string
  }[]
  organizations?: {
    id: number
    name: string
    url: string
  }[]
  foods?: {
    id: number
    name: string
  }[]
}>()
</script>

<template>
  <Head title="Async Request" />
  <h1 class="text-3xl">Deferred Props</h1>
  <div class="mt-6 rounded border border-yellow-500 bg-yellow-200 p-4">
    <p>Page is loaded!</p>
  </div>
  <TestGrid>
    <TestGridItem>
      <Deferred :data="users">
        <template #loading>
          <p>Loading Users...</p>
        </template>

        <div v-for="user in users">
          <p>#{{ user.id }}: {{ user.name }} ({{ user.email }})</p>
        </div>
      </Deferred>
    </TestGridItem>

    <TestGridItem>
      <Deferred :data="foods">
        <template #loading>
          <p>Loading Foods...</p>
        </template>

        <div v-for="food in foods">
          <p>#{{ food.id }}: {{ food.name }}</p>
        </div>
      </Deferred>
    </TestGridItem>

    <TestGridItem>
      <Deferred :data="organizations">
        <template #loading>
          <p>Loading Organizations...</p>
        </template>

        <div v-for="org in organizations">
          <p>#{{ org.id }}: {{ org.name }} ({{ org.url }})</p>
        </div>
      </Deferred>
    </TestGridItem>
  </TestGrid>
</template>
