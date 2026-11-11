import { describe, expect, it } from 'vitest'
import { reloadUrlOf } from '../src/layers'
import { page as currentPage } from '../src/page'
import { partialReloadFillsDeferred } from '../src/partialReload'
import { LayerState, Page, PendingVisit } from '../src/types'
import { hrefToUrl } from '../src/url'
import { pageWith } from './support/layers'

describe('partialReloadFillsDeferred', () => {
  const layer = (id: string, url: string): LayerState =>
    ({ id, key: id, component: id, props: {}, url, entries: 0, owner: null }) as unknown as LayerState

  const stand = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const reloadOf = (url: string, layerId?: string): PendingVisit =>
    ({ url: hrefToUrl(url), layerId, preserveState: true, only: ['stats'], except: [] }) as unknown as PendingVisit

  it('matches a base reload against the base url while a layer owns the address', () => {
    stand({ ...pageWith({ url: '/users' }), layers: [layer('layer-1', '/users/5/edit')] })

    expect(reloadUrlOf(currentPage.get(), undefined, window.location.href)).toBe('/users')
    expect(partialReloadFillsDeferred(reloadOf('/users'), undefined, ['stats'])).toBe(true)
    expect(partialReloadFillsDeferred(reloadOf('/users/5/edit', 'layer-1'), undefined, ['stats'])).toBe(false)
  })

  it('matches a base reload against the address when no layer is open', () => {
    stand(pageWith({ url: '/users' }))

    expect(reloadUrlOf(currentPage.get(), undefined, window.location.href)).toBe(window.location.href)
    expect(partialReloadFillsDeferred(reloadOf(window.location.href), undefined, ['stats'])).toBe(true)
  })

  it('matches a layer reload against the layer url, on that layer only', () => {
    stand({ ...pageWith(), layers: [layer('layer-1', '/users/5/edit')] })

    expect(partialReloadFillsDeferred(reloadOf('/users/5/edit', 'layer-1'), 'layer-1', ['stats'])).toBe(true)
    expect(partialReloadFillsDeferred(reloadOf('/users/5/edit', 'layer-1'), undefined, ['stats'])).toBe(false)
    expect(partialReloadFillsDeferred(reloadOf('/users/5/edit', 'layer-1'), 'layer-1', ['other'])).toBe(false)
  })
})
