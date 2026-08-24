<script setup lang="ts">
import { Link, router, usePage, useRemember, setLayoutProps } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{ likes: number }>()

const page = usePage()
const visitEvents = ref<string[]>([])
const childEvents = ref('')
const cancelledEvent = ref('')
const remembered = useRemember({ note: '' })

const pushPanel = () => {
  router.push({
    url: '/layers/panel/client',
    component: 'Layers/Panel',
    props: { name: 'from a client visit' },
  })
}

const openPanelWithCallbacks = () => {
  router.visit('/layers/panel/first', {
    onFlash: () => visitEvents.value.push('flash'),
    onError: () => visitEvents.value.push('error'),
    onSuccess: () => visitEvents.value.push('success'),
  })
}

const openPanelWithViewTransition = () => {
  router.visit('/layers/panel/first', { viewTransition: true })
}

const like = () => {
  router.optimistic<{ likes: number }>((props) => ({ likes: props.likes + 1 })).post('/layers/like')
}

const refresh = () => {
  router.reload()
}

const openPanelWithoutMovingTheAddress = () => {
  router.visit('/layers/counted/panel', { preserveUrl: true })
}

const partialReload = () => {
  router.reload({ only: ['likes'] })
}

const openHandledPanel = () => {
  const handle = router.layer('/layers/panel/first')
  handle.on('saved', (user) => (childEvents.value = `saved ${(user as { id?: number })?.id}`))
}

const openCancelledPanel = () => {
  const handle = router.layer('/layers/panel/delayed?delay=600')
  handle.onClose(() => (cancelledEvent.value = 'closed'))
}

const openLocalLayer = () => {
  router.layer({ component: 'Layers/Local', props: { note: 'local' } })
}

const setBaseChrome = () => {
  setLayoutProps({ baseChrome: 'base' })
}
</script>

<template>
  <div>Base page</div>

  <div id="spacer" style="height: 1000px"></div>

  <p v-if="page.props.errors?.name" id="page-error">{{ page.props.errors.name }}</p>

  <div id="layer-count">{{ page.layers?.length ?? 0 }}</div>
  <div id="visit-events">{{ visitEvents.join(',') }}</div>
  <div id="page-flash">{{ (page.flash as { message?: string })?.message ?? '' }}</div>
  <div id="likes">{{ likes }}</div>
  <div id="child-events">{{ childEvents }}</div>
  <div id="cancelled-event">{{ cancelledEvent }}</div>

  <input id="note" />
  <input id="remembered-note" v-model="remembered.note" />

  <Link href="/layers/panel/first">Open panel</Link>
  <Link href="/layers/guarded">Open guarded panel</Link>
  <Link href="/layers/panel/second">Open second panel</Link>
  <Link href="/layers/panel/third">Open third panel</Link>
  <Link href="/layers/slow">Open slow panel</Link>
  <Link href="/layers/panel/delayed?delay=600">Open delayed panel</Link>
  <Link href="/layers/settings">Open settings</Link>
  <Link href="/layers/step/one">Open step one</Link>
  <Link href="/layers/step/two">Open step two</Link>
  <Link href="/layers/counted/panel">Open counted panel</Link>
  <Link href="/layers/deferred">Open deferred layer</Link>

  <button @click="pushPanel">Push panel as a page</button>
  <button @click="openPanelWithCallbacks">Open panel with callbacks</button>
  <button @click="openPanelWithViewTransition">Open panel with view transition</button>
  <button @click="like">Like</button>
  <button @click="refresh">Refresh in the background</button>
  <button @click="openPanelWithoutMovingTheAddress">Open panel without moving the address</button>
  <button @click="partialReload">Partial reload</button>
  <button @click="openHandledPanel">Open handled panel</button>
  <button @click="openCancelledPanel">Open cancelled panel</button>
  <button @click="openLocalLayer">Open local layer</button>
  <button @click="setBaseChrome">Set base chrome</button>
</template>
