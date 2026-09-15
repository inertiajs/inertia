import { router, useForm, useLayer, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default ({ name, count, errors }: { name: string; count?: number; errors?: { note?: string } }) => {
  const page = usePage()
  const layer = useLayer()
  const form = useForm('note', { note: '' })

  const [childEvents, setChildEvents] = useState('')

  useEffect(() => layer.on('saved', (payload) => setChildEvents(`saved ${(payload as { id: number }).id}`)), [layer])

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

  return (
    <>
      <div>Panel layer: {name}</div>

      {/* usePage() inside a layer resolves the layer's own page, not the composite's. */}
      <div data-testid="layer-use-page">
        {(page.props as { name?: string }).name}|{page.url}|{page.component}
      </div>

      <div data-testid="panel-count">{count}</div>

      <div id="panel-child-events">{childEvents}</div>

      {errors?.note && <p className="panel-error">{errors.note}</p>}

      <input className="panel-note" />
      <input
        className="layer-remembered"
        value={form.data.note}
        onChange={(e) => form.setData('note', e.target.value)}
      />

      {form.errors.note && <p className="panel-form-error">{form.errors.note}</p>}

      <button onClick={save}>Save panel</button>
      <button onClick={submitForm}>Submit panel form</button>
      <button onClick={submitFormOptimistically}>Submit panel form optimistically</button>
      <button onClick={saveAndClose}>Save and close</button>
      <button onClick={openNext}>Open next panel</button>
      <button onClick={openNextInstantly}>Instantly open the next panel</button>
      <button onClick={openNextWithoutMovingTheAddress}>Open a second panel without moving the address</button>
      <button onClick={partialReload}>Partial reload panel</button>
      <button onClick={partialThroughTheLayerRouter}>Partial through the layer router</button>
      <button onClick={reloadBase}>Reload base beneath</button>
      <button onClick={bumpCount}>Layer replaceProp</button>
      <button onClick={likeAndClose}>Like and close</button>
      <button onClick={likeInBackgroundAndClose}>Like in the background and close</button>
      <button onClick={openChild}>Open child layer</button>
      <button onClick={openChildThroughTheLayer}>Open child through the layer</button>
    </>
  )
}
