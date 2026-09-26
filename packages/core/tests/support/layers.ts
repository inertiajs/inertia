import { http } from '../../src/http'
import { layersOf } from '../../src/layers'
import { layerClosing } from '../../src/layers/closing'
import { page as currentPage } from '../../src/page'
import { Page } from '../../src/types'

export const pageWith = (overrides: Partial<Page> = {}): Page =>
  ({
    component: 'Users/Index',
    props: { users: [] },
    url: '/users',
    version: null,
    rescuedProps: [],
    flash: {},
    rememberedState: {},
    ...overrides,
  }) as Page

export const editLayer = (overrides: Partial<Page> = {}): Page =>
  pageWith({
    component: 'Users/Edit',
    url: '/users/5/edit',
    layer: { key: 'Users/Edit' },
    props: { user: { id: 5 } },
    ...overrides,
  })

export const hold = async (page: Page): Promise<Page> => {
  currentPage.init({
    initialPage: page,
    resolveComponent: (name) => ({ name }) as never,
    // Stands in for the adapter's shell: exits are reported after the swap that marked them, not inside it.
    swapComponent: async ({ layers }) => {
      const closing = (layers ?? []).filter((layer) => !layer.shell.open)

      if (closing.length > 0) {
        queueMicrotask(() => closing.forEach((layer) => layerClosing.closed(layer.id)))
      }
    },
  })

  await currentPage.setQuietly(page)

  return page
}

export const settled = (): Promise<unknown> => new Promise((resolve) => setTimeout(resolve))

export const topLayerId = (): string => layersOf(currentPage.get()).at(-1)!.id

export const marked = async (id = topLayerId()): Promise<void> => {
  layerClosing.close(id)

  await currentPage.rerender()
}

export const respondWith = (page: Page) =>
  http.setClient({
    request: async () => ({ status: 200, data: page as unknown as string, headers: { 'x-inertia': 'true' } }),
  })

export const holding = () => {
  let answer: ((response: unknown) => void) | null = null

  http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

  return () => answer
}
