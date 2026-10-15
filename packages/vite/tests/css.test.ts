import { join } from 'node:path'
import { createServer, type Plugin } from 'vite'
import { describe, expect, it } from 'vitest'
import { collectCSSFromModuleGraph } from '../src/css'

const root = join(import.meta.dirname, 'fixtures', 'ssr-css')

function virtualStylesheet(): Plugin {
  return {
    name: 'virtual-stylesheet',
    resolveId(id) {
      if (id.startsWith('virtual:theme.css')) {
        return id
      }
    },
    load(id) {
      if (id.startsWith('virtual:theme.css')) {
        return 'body { background: blue; }'
      }
    },
  }
}

describe('CSS collection', () => {
  it('collects stylesheet links from the SSR module graph of a real dev server', async () => {
    const server = await createServer({
      configFile: false,
      root,
      logLevel: 'silent',
      appType: 'custom',
      server: { middlewareMode: true, hmr: false, ws: false },
      plugins: [virtualStylesheet()],
    })

    try {
      await server.ssrLoadModule('ssr.js')

      expect(collectCSSFromModuleGraph(server, 'ssr.js')).toEqual([
        expect.stringMatching(
          /^<link rel="stylesheet" href="http:\/\/localhost:5173\/app\.css" data-vite-dev-id=".+\/app\.css">$/,
        ),
        '<link rel="stylesheet" href="http://localhost:5173/virtual:theme.css" data-vite-dev-id="virtual:theme.css">',
      ])
    } finally {
      await server.close()
    }
  })
})
