<script lang="ts">
  import { router, useForm, useLayer, usePage } from '@inertiajs/svelte'
  import { onDestroy } from 'svelte'

  let { name, count, errors }: { name: string; count?: number; errors?: { note?: string } } = $props()

  const page = usePage()
  const layer = useLayer()
  const form = useForm('note', { note: '' })

  let childEvents = $state('')

  onDestroy(layer.on('saved', (payload) => (childEvents = `saved ${(payload as { id: number }).id}`)))

  const save = () => {
    router.post(`/layers/panel/${name}/save`)
  }

  const submitForm = () => {
    form.post(`/layers/panel/${name}/save`)
  }

  const submitFormOptimistically = () => {
    form.optimistic<{ count: number }>((current) => ({ ...current, count: 99 })).post(`/layers/panel/${name}/save-slow`)
  }

  const saveAndClose = () => {
    router.post('/layers/close')
  }

  const openNext = () => {
    router.post(`/layers/panel/${name}/next`)
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
    layer.get(`/layers/panel/${name}`, {}, { only: ['count'] })
  }

  const reloadBase = () => {
    router.reload()
  }

  const bumpCount = () => {
    layer.replaceProp('count', (old: unknown) => Number(old ?? 0) + 1)
  }

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

<div>Panel layer: {name}</div>

<div data-testid="layer-use-page">
  {(page.props as { name?: string }).name}|{page.url}|{page.component}
</div>

<div data-testid="panel-count">{count}</div>

<div id="panel-child-events">{childEvents}</div>

{#if errors?.note}
  <p class="panel-error">{errors.note}</p>
{/if}

<input class="panel-note" />
<input class="layer-remembered" bind:value={form.note} />

{#if form.errors.note}
  <p class="panel-form-error">{form.errors.note}</p>
{/if}

<button onclick={save}>Save panel</button>
<button onclick={submitForm}>Submit panel form</button>
<button onclick={submitFormOptimistically}>Submit panel form optimistically</button>
<button onclick={saveAndClose}>Save and close</button>
<button onclick={openNext}>Open next panel</button>
<button onclick={openNextInstantly}>Instantly open the next panel</button>
<button onclick={openNextWithoutMovingTheAddress}>Open a second panel without moving the address</button>
<button onclick={partialReload}>Partial reload panel</button>
<button onclick={partialThroughTheLayerRouter}>Partial through the layer router</button>
<button onclick={reloadBase}>Reload base beneath</button>
<button onclick={bumpCount}>Layer replaceProp</button>
<button onclick={likeAndClose}>Like and close</button>
<button onclick={likeInBackgroundAndClose}>Like in the background and close</button>
<button onclick={openChild}>Open child layer</button>
<button onclick={openChildThroughTheLayer}>Open child through the layer</button>
