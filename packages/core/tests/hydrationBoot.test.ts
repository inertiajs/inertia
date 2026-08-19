import { afterEach, describe, expect, it, vi } from 'vitest'

// The module holds mutable top-level state, so each test needs a fresh instance.
const loadFresh = async () => {
  vi.resetModules()
  return import('../src/hydrationBoot')
}

describe('hydrationBoot', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('blocks rendering until markClientRendered runs, on a hydration boot', async () => {
    vi.stubGlobal('window', {})
    const { canRenderClientOnly, markClientRendered } = await loadFresh()

    expect(canRenderClientOnly()).toBe(false)
    markClientRendered()
    expect(canRenderClientOnly()).toBe(true)
  })

  it('allows rendering immediately when the boot is not a hydration pass', async () => {
    vi.stubGlobal('window', {})
    const { canRenderClientOnly, setHydrationBoot } = await loadFresh()

    setHydrationBoot(false)
    expect(canRenderClientOnly()).toBe(true)
  })

  it('resets the client-rendered flag whenever a new boot is announced', async () => {
    vi.stubGlobal('window', {})
    const { canRenderClientOnly, markClientRendered, setHydrationBoot } = await loadFresh()

    markClientRendered()
    expect(canRenderClientOnly()).toBe(true)

    setHydrationBoot(true)
    expect(canRenderClientOnly()).toBe(false)
  })

  it('is inert on the server: writes no-op and rendering is always blocked', async () => {
    // No `window` stub -- this runs in the default (windowless) test environment.
    const { canRenderClientOnly, markClientRendered, setHydrationBoot } = await loadFresh()

    setHydrationBoot(false)
    markClientRendered()

    expect(canRenderClientOnly()).toBe(false)
  })
})
