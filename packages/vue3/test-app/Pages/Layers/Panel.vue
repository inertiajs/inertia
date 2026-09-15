<script setup lang="ts">
import { router, useForm, useLayer, usePage } from '@inertiajs/vue3'
import { onUnmounted, ref } from 'vue'

const props = defineProps<{ name: string; count?: number; errors?: { note?: string } }>()

const page = usePage()
const layer = useLayer()
const form = useForm('note', { note: '' })

const save = () => {
  router.post(`/layers/panel/${props.name}/save`)
}

const submitForm = () => {
  form.post(`/layers/panel/${props.name}/save`)
}

const submitFormOptimistically = () => {
  form
    .optimistic<{ count: number }>((current) => ({ ...current, count: 99 }))
    .post(`/layers/panel/${props.name}/save-slow`)
}

const saveAndClose = () => {
  router.post('/layers/close')
}

const openNext = () => {
  router.post(`/layers/panel/${props.name}/next`)
}

const openNextInstantly = () => {
  layer.visit('/layers/panel/second?delay=500', { component: 'Layers/Panel' })
}

const openNextWithoutMovingTheAddress = () => {
  router.visit('/layers/panel/second', { preserveUrl: true })
}

const partialReload = () => {
  layer.reload({ only: ['count'] })
}

const partialThroughTheLayerRouter = () => {
  layer.get(`/layers/panel/${props.name}`, {}, { only: ['count'] })
}

const reloadBase = () => {
  router.reload()
}

const bumpCount = () => {
  layer.replaceProp('count', (old: unknown) => Number(old ?? 0) + 1)
}

const childEvents = ref('')
const stopListening = layer.on('saved', (payload) => {
  childEvents.value = `saved ${(payload as { id: number }).id}`
})

onUnmounted(stopListening)

const openChild = () => {
  const handle = router.layer('/layers/child')
  window.testing.childHandle = handle
}

const likeAndClose = () => {
  router.post('/layers/like')
  layer.close()
}

const likeInBackgroundAndClose = () => {
  router.post('/layers/like', {}, { async: true })
  layer.close()
}

const openChildThroughTheLayer = () => {
  const handle = layer.layer('/layers/child')
  window.testing.layerChildHandle = handle
}
</script>

<template>
  <div>Panel layer: {{ name }}</div>

  <div data-testid="layer-use-page">
    {{ (page as any).props.name }}|{{ (page as any).url }}|{{ (page as any).component }}
  </div>

  <div data-testid="panel-count">{{ count }}</div>

  <div id="panel-child-events">{{ childEvents }}</div>

  <p v-if="props.errors?.note" class="panel-error">{{ props.errors.note }}</p>

  <input class="panel-note" />
  <input class="layer-remembered" v-model="form.note" />

  <p v-if="form.errors.note" class="panel-form-error">{{ form.errors.note }}</p>

  <button @click="save">Save panel</button>
  <button @click="submitForm">Submit panel form</button>
  <button @click="submitFormOptimistically">Submit panel form optimistically</button>
  <button @click="saveAndClose">Save and close</button>
  <button @click="openNext">Open next panel</button>
  <button @click="openNextInstantly">Instantly open the next panel</button>
  <button @click="openNextWithoutMovingTheAddress">Open a second panel without moving the address</button>
  <button @click="partialReload">Partial reload panel</button>
  <button @click="partialThroughTheLayerRouter">Partial through the layer router</button>
  <button @click="reloadBase">Reload base beneath</button>
  <button @click="bumpCount">Layer replaceProp</button>
  <button @click="likeAndClose">Like and close</button>
  <button @click="likeInBackgroundAndClose">Like in the background and close</button>
  <button @click="openChild">Open child layer</button>
  <button @click="openChildThroughTheLayer">Open child through the layer</button>
</template>
