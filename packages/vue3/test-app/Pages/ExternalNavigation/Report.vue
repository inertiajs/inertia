<script setup lang="ts">
import { Deferred, Link, router, setLayoutProps, useForm, usePage } from '@inertiajs/vue3'
import AppLayout from '../../Layouts/AppLayout.vue'

defineOptions({ layout: [AppLayout, { title: 'Fresh layout' }] })

const props = defineProps<{ report: string; total: number; details?: string; optional?: string }>()
const form = useForm('report', { name: '' })
const page = usePage()

const saveWithOrdinaryResponse = () =>
  router.post(
    `/external-navigation/${props.report}/destination`,
    {},
    {
      onFlash: () => (document.body.dataset.navigationOrder = 'flash,'),
      onSuccess: () => (document.body.dataset.navigationOrder += 'success,'),
    },
  )

const queueHeadAndClose = () => {
  router.replace({
    props: { head: ['<title data-inertia="external-report">Queued head</title>'] },
    onFinish: () => document.getElementById('leave')!.click(),
  })
}
</script>

<template>
  <h1>Report {{ report }}</h1>
  <p>Total: {{ total }}</p>
  <p>Flash: {{ page.flash.toast?.message || '' }}</p>
  <Deferred data="details">
    <template #fallback><p>Loading details</p></template>
    <p>{{ details }}</p>
  </Deferred>
  <p>{{ optional }}</p>
  <form @submit.prevent="form.post(`/external-navigation/${report}`, { preserveScroll: true })">
    <label>Name<input v-model="form.name" /></label>
    <p>{{ form.errors.name }}</p>
    <button :disabled="form.processing">Save report</button>
  </form>
  <button @click="router.reload({ only: ['optional'] })">Load optional summary</button>
  <button @click="router.reload({ only: ['total'] })">Refresh total</button>
  <button @click="router.poll(100, { only: ['total'] })">Start polling</button>
  <button @click="router.post(`/external-navigation/${report}/redirect`)">Save and open next report</button>
  <button @click="saveWithOrdinaryResponse">Save with ordinary response</button>
  <button @click="router.replaceProp('total', 999)">Replace total locally</button>
  <button @click="router.push({ url: '/external-navigation/2' })">Push next report</button>
  <button @click="setLayoutProps<{ title: string }>({ title: 'Changed layout' })">Change layout</button>
  <button @click="queueHeadAndClose">Queue head and close</button>
  <Link href="/external-navigation/2">Next report</Link>
  <Link href="/non-inertia">Leave application</Link>
</template>
