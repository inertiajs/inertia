import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type FakeElement = {
  id: string
  innerHTML: string
  nonce: string
  popover: string
  style: Record<string, string>
  tagName: string
  textContent: string
}

describe('ProgressComponent', () => {
  let elements: Record<string, FakeElement>

  beforeEach(() => {
    vi.resetModules()

    elements = {}

    class FakeHTMLElement {}

    vi.stubGlobal('HTMLElement', FakeHTMLElement)

    vi.stubGlobal('document', {
      createElement: (tagName: string) => {
        return {
          id: '',
          innerHTML: '',
          nonce: '',
          popover: '',
          style: {},
          tagName,
          textContent: '',
        }
      },
      addEventListener: vi.fn(),
      head: {
        appendChild: (element: FakeElement) => {
          elements[element.tagName] = element
        },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds a nonce to the injected progress style element', async () => {
    const { default: setupProgress } = await import('../src/progress')

    setupProgress({ includeCSS: true, nonce: 'nonce-value' })

    expect(elements.style.nonce).toBe('nonce-value')
  })

  it('does not add a nonce to the injected progress style element by default', async () => {
    const { default: setupProgress } = await import('../src/progress')

    setupProgress({ includeCSS: true })

    expect(elements.style.nonce).toBe('')
  })

  it('does not reuse a nonce from a previous progress setup', async () => {
    const { default: setupProgress } = await import('../src/progress')

    setupProgress({ includeCSS: true, nonce: 'nonce-value' })
    setupProgress({ includeCSS: true })

    expect(elements.style.nonce).toBe('')
  })
})
