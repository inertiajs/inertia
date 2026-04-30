import { describe, expect, it } from 'vitest'
import createHeadManager from '../src/head'

describe('createHeadManager', () => {
  describe('SSR title escaping', () => {
    it('escapes HTML in the title element to prevent XSS injection via newline bypass', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
      )

      const provider = manager.createProvider()
      provider.update([`<title data-inertia="">Safe Title\n</title><script>alert('xss')</script></title>`])

      const head = collected[collected.length - 1].join('')

      expect(head).not.toContain('<script>alert(')
    })
  })
})
