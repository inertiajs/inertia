import { afterEach, describe, expect, it } from 'vitest'
import { LayerEvent, interceptors } from '../src/interceptors'
import { closeLayer, composeLayer } from '../src/layers'
import { layerClosing } from '../src/layers/closing'
import { createLayerHandle } from '../src/layers/handles'
import { page as currentPage } from '../src/page'
import { hold, pageWith, settled } from './support/layers'

// The registry is what development tooling hooks into, so every way the stack changes is
// announced through it, along with what a layer emits to whatever opened it.
describe('layer events for development tooling', () => {
  const heard: LayerEvent[] = []
  const stop = interceptors.onLayerEvent((event) => heard.push(event))

  const stackOf = (...keys: string[]): ReturnType<typeof pageWith> =>
    keys.reduce(
      (page, key, index) =>
        composeLayer(
          page,
          pageWith({ component: key, url: `/${key.toLowerCase()}`, layer: { key } }),
          `layer-${index + 1}`,
        ),
      pageWith(),
    )

  const kinds = () => heard.map((event) => (event.type === 'event' ? event.name : `${event.type}:${event.layer.id}`))

  afterEach(() => {
    heard.length = 0
    layerClosing.unwound()
  })

  it('announces a layer landing on the stack', async () => {
    await hold(pageWith())
    heard.length = 0

    await currentPage.set(stackOf('Users/Edit'), { preservesBase: true })

    expect(kinds()).toEqual(['opened:layer-1'])
    expect(heard[0]).toMatchObject({ type: 'opened', layer: { id: 'layer-1', key: 'Users/Edit' } })
  })

  it('announces every layer of a stack that opens at once, deepest first', async () => {
    await hold(pageWith())
    heard.length = 0

    await currentPage.set(stackOf('Users/Edit', 'Teams/Show'), { preservesBase: true })

    expect(kinds()).toEqual(['opened:layer-1', 'opened:layer-2'])
  })

  it('announces a layer leaving the stack, however it was written out', async () => {
    await hold(stackOf('Users/Edit', 'Teams/Show'))
    heard.length = 0

    await currentPage.set(closeLayer(currentPage.get(), 'layer-1'), { preserveState: true, preservesBase: true })

    expect(kinds()).toEqual(['closed:layer-1', 'closed:layer-2'])
  })

  it('announces a dismissed layer once the shell has run its exit', async () => {
    await hold(stackOf('Users/Edit', 'Teams/Show'))
    heard.length = 0

    await layerClosing.dismiss('layer-2')
    await settled()

    expect(kinds()).toEqual(['closed:layer-2'])
  })

  it('announces a rewrite as nothing: the layer is still the layer it was', async () => {
    await hold(stackOf('Users/Edit'))
    heard.length = 0

    const rewritten = composeLayer(
      pageWith(),
      pageWith({ component: 'Users/Edit', url: '/users/6/edit', layer: { key: 'Users/Edit' } }),
      'layer-1',
    )

    await currentPage.set(rewritten, { preserveState: true, preservesBase: true })

    expect(kinds()).toEqual([])
  })

  it('announces the whole stack of a document that opens on one', async () => {
    currentPage.init({
      initialPage: stackOf('Users/Edit'),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })
    heard.length = 0

    await currentPage.set(currentPage.get(), { preserveState: true, initialRender: true })

    expect(kinds()).toEqual(['opened:layer-1'])
  })

  it('announces what a layer emits, and to whom', () => {
    const handle = createLayerHandle(
      'layer-1',
      () => Promise.resolve(),
      () => 'base-1',
    )

    handle.emit('saved', { id: 5 })

    expect(heard).toEqual([{ type: 'event', from: 'layer-1', to: 'base-1', name: 'saved', payload: { id: 5 } }])
  })

  it('announces an emit from a layer nobody opened, with no recipient', () => {
    createLayerHandle(
      'layer-1',
      () => Promise.resolve(),
      () => null,
    ).emit('saved')

    expect(heard).toEqual([{ type: 'event', from: 'layer-1', to: null, name: 'saved', payload: undefined }])
  })

  it('keeps a handler that throws from breaking the write that announced', async () => {
    const unsubscribe = interceptors.onLayerEvent(() => {
      throw new Error('tooling bug')
    })

    await hold(pageWith())

    await expect(currentPage.set(stackOf('Users/Edit'), { preservesBase: true })).resolves.toBeUndefined()
    expect(currentPage.get().layers?.map((layer) => layer.id)).toEqual(['layer-1'])

    unsubscribe()
  })

  it('stops announcing to a handler once it is unsubscribed', async () => {
    stop()
    await hold(pageWith())
    heard.length = 0

    await currentPage.set(stackOf('Users/Edit'), { preservesBase: true })

    expect(heard).toEqual([])
  })
})
