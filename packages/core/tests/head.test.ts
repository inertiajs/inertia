import { describe, expect, it } from 'vitest'
import createHeadManager from '../src/head'

describe('createHeadManager', () => {
  describe('SSR title escaping', () => {
    it('escapes HTML in the title element to prevent XSS injection via newline bypass', async () => {
      const manager = createHeadManager(
        true,
        (title) => title,
      )

      const provider = manager.createProvider()
      provider.update({ title: "Safe Title\n</title><script>alert('xss')</script>" })

      const head = (await manager.renderSSR!()).join('')

      expect(head).not.toContain('<script>alert(')
      expect(head).toContain('Safe Title')
    })
  })
})
