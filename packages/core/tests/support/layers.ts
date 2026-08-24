import { http } from '../../src/http'
import { layerClosing } from '../../src/layers'
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

// The layer most of these tests open: a keyed response over the users page.
export const editLayer = (overrides: Partial<Page> = {}): Page =>
  pageWith({
    component: 'Users/Edit',
    url: '/users/5/edit',
    layer: { key: 'Users/Edit' },
    props: { user: { id: 5 } },
    ...overrides,
  })

/**
 * Puts a page on screen without a visit, so a test starts from a stack it composed itself. It
 * navigates onto the page rather than starting on it, so the base's generation is past the value an
 * uncaptured capture would hold.
 */
export const hold = async (page: Page): Promise<Page> => {
  currentPage.init({
    initialPage: page,
    resolveComponent: (name) => ({ name }) as never,
    // Standing in for the shell an adapter mounts, which reports each closing layer's exit once its
    // animation has run, never synchronously inside the swap that marked it.
    swapComponent: async ({ layers }) => {
      const closing = (layers ?? []).filter((layer) => layer.isClosing)

      if (closing.length > 0) {
        queueMicrotask(() => closing.forEach((layer) => layerClosing.closed(layer.id)))
      }
    },
  })

  await currentPage.setQuietly(page)

  return page
}

/** Lets everything already queued run: renders, history writes and request callbacks. */
export const settled = (): Promise<unknown> => new Promise((resolve) => setTimeout(resolve))

/** Marks a close and lets the marking render, which is what the shell sees before its exit runs. */
export const marked = async (id?: string): Promise<void> => {
  layerClosing.close(id)

  await currentPage.rerender()
}

/** Answers every request with the given page. */
export const respondWith = (page: Page) =>
  http.setClient({
    request: async () => ({ status: 200, data: page as unknown as string, headers: { 'x-inertia': 'true' } }),
  })

/** Holds every request open, handing each resolve out once. */
export const holding = () => {
  let answer: ((response: unknown) => void) | null = null

  http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

  return () => answer
}
