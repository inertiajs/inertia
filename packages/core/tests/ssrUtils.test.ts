import { describe, expect, it } from 'vitest'
import { buildSSRBody } from '../src/ssrUtils'
import type { Page } from '../src/types'

const buildPage = (props: Page['props']): Page => ({
  component: 'Home',
  props,
  url: '/',
  version: null,
  clearHistory: false,
  encryptHistory: false,
})

describe('buildSSRBody', () => {
  it('escapes characters that would break out of the script element', () => {
    const body = buildSSRBody('app', buildPage({ title: '</script><!--<script>' }), '<div>Hello</div>')

    expect(body).toContain('\\u003c\\/script>\\u003c!--\\u003cscript>')
    expect(body).not.toContain('<!--')
    expect(body.indexOf('</script>')).toBe(body.lastIndexOf('</script>'))
  })

  it('keeps the page data intact after escaping', () => {
    const props = { title: '</script><!--<script>', nested: { html: '<b>bold</b>' } }
    const body = buildSSRBody('app', buildPage(props), '')
    const json = body.slice(body.indexOf('>') + 1, body.indexOf('</script>'))

    expect(JSON.parse(json).props).toEqual(props)
  })
})
