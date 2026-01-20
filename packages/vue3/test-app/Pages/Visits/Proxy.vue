<script setup lang="ts">
import { Deferred, Link, router } from '@inertiajs/vue3'
import { toRef } from 'vue'

const props = defineProps<{
  foo: number
  sites?: Array<{
    id: number
    latestDeployment: {
      id: number
      statuses: string[]
    }
  }>
}>()

const sites = toRef(props, 'sites')

const updateFirstSite = () => {
  if (sites.value && sites.value.length > 0) {
    const incomingPartialData = { statuses: [`frontend-${Math.floor(Math.random() * 1_000_000)}`] }
    sites.value[0].latestDeployment = { ...sites.value[0].latestDeployment, ...incomingPartialData }
  }
}

function submit() {
  router.post(
    '/visits/proxy',
    {},
    {
      preserveScroll: true,
      preserveState: true,
      only: ['foo'],
    },
  )
}
</script>

<template>
  <p id="foo">Foo: {{ props.foo }}</p>

  <Deferred data="sites">
    <template #fallback>Loading...</template>

    <div v-for="site in sites" :key="site.id">
      <p>Site ID: {{ site.id }}</p>
      <p>Latest Deployment ID: {{ site.latestDeployment.id }}</p>
      <p :id="`status-${site.id}`">Statuses: {{ site.latestDeployment.statuses.join(', ') }}</p>
    </div>
  </Deferred>

  <button @click="updateFirstSite">Update First Site Ref</button>
  <button @click="submit">Reload</button>
  <Link href="/">Go Home</Link>
</template>
