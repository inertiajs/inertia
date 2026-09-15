import { describe, expect, it, vi } from 'vitest'
import { history } from '../src/history'
import { composeLayer } from '../src/layers'
import Queue from '../src/queue'
import { Page, PageProps } from '../src/types'

const pageWith = (props: PageProps): Page => ({
  component: 'Users/Index',
  props: {
    errors: {},
    ...props,
  },
  url: '/users',
  version: null,
  rescuedProps: [],
  flash: {},
  rememberedState: {},
})

const clonePageProps = (page: Page): Page =>
  (history as unknown as { clonePageProps(page: Page): Page }).clonePageProps(page)

describe('clonePageProps', () => {
  it('returns props the browser can store in history', () => {
    const page = clonePageProps(pageWith({ name: 'Joe', onClick: () => {} }))

    expect(() => structuredClone(page.props)).not.toThrow()
  })

  it('returns the page untouched when its props are already cloneable', () => {
    const page = pageWith({ name: 'Joe' })

    expect(clonePageProps(page)).toBe(page)
  })

  it('does not mutate the original props', () => {
    const onClick = () => {}
    const page = pageWith({ onClick })

    clonePageProps(page)

    expect(page.props.onClick).toBe(onClick)
  })

  it('returns props the browser can store when the unstorable ones are on a layer', () => {
    const layer = { ...pageWith({ onClick: () => {} }), component: 'Users/Edit', layer: { key: 'Users/Edit' } }
    const page = clonePageProps(composeLayer(pageWith({}), layer as Page, 'layer-1'))

    expect(() => structuredClone(page)).not.toThrow()
  })
})

describe('the write queue', () => {
  it('runs an item added while the item ahead of it was settling', async () => {
    const queue = new Queue<Promise<void>>()
    const ran: string[] = []
    let first!: Promise<void>

    queue.add(() => (first = Promise.resolve().then(() => void ran.push('first'))))
    await first.then(() => queue.add(() => Promise.resolve().then(() => void ran.push('second'))))
    await new Promise((resolve) => setTimeout(resolve))

    expect(ran).toEqual(['first', 'second'])
  })
})

describe('remembering state on the server', () => {
  const withoutWindow = async (run: (history: { remember(data: unknown, key: string): void }) => void) => {
    vi.resetModules()

    const browser = globalThis.window

    // @ts-expect-error the server has none
    delete globalThis.window

    try {
      run((await import('../src/history')).history)
    } finally {
      globalThis.window = browser
    }
  }

  it('does nothing, since a render has no history to remember into', async () => {
    await withoutWindow((history) => expect(() => history.remember({ name: 'Joe' }, 'default')).not.toThrow())
  })
})
