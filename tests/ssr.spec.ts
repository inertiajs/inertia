import { expect, test } from '@playwright/test'
import { consoleMessages, pageLoads } from './support'

const SSR_SERVER_PORT = 13714
const SSR_AUTO_PORTS: Record<string, number> = { vue3: 13718, react: 13719, svelte: 13720 }
const SSR_AUTO_SERVER_PORT = SSR_AUTO_PORTS[process.env.PACKAGE || 'vue3']

test.describe('SSR', () => {
  test.describe('initial page load', () => {
    test('renders HTML with props on the server', async ({ page }) => {
      const response = await page.request.get('/ssr/page1')
      const html = await response.text()

      expect(html).toContain('<script data-page="app" type="application/json">')
      expect(html).toMatch(/Name:.*John Doe/)
      expect(html).toMatch(/Email:.*john@example\.com/)
      expect(html).toContain('Item 1')
      expect(html).toContain('Item 2')
      expect(html).toContain('Item 3')
      expect(html).toMatch(/Count:.*42/)
      expect(html).toMatch(/URL:.*\/ssr\/page1/)
    })

    test('hydrates correctly after initial SSR load', async ({ page }) => {
      consoleMessages.listen(page)

      await page.goto('/ssr/page1')

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')
      await expect(page.getByTestId('user-name')).toHaveText('Name: John Doe')
      await expect(page.getByTestId('count')).toHaveText('Count: 42')
      await expect(page.getByTestId('page-url')).toHaveText('URL: /ssr/page1')

      expect(consoleMessages.errors).toHaveLength(0)
    })
  })

  test('embeds page data in a script element', async ({ page }) => {
    const response = await page.request.get('/ssr/page-with-script-element')
    const html = await response.text()

    expect(html).toContain('data-page="app"')
    expect(html).toContain('<script data-page="app" type="application/json">')
    expect(html).toContain('Hello from script element! Escape <\\/script>.')

    await page.goto('/ssr/page-with-script-element')
    const scriptContent = await page.locator('script[data-page="app"]').textContent()
    expect(JSON.parse(scriptContent || '')).toMatchObject({
      component: 'SSR/PageWithScriptElement',
      props: {
        message: 'Hello from script element! Escape </script>.',
      },
    })
  })

  test.describe('client-side navigation', () => {
    test('navigates without full page reload after SSR', async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/ssr/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      await page.getByTestId('navigate-link').click()

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')
      await expect(page.getByTestId('navigated-status')).toHaveText('Navigated: true')
      expect(pageLoads.count).toBe(1)
    })

    test('can navigate back and forth after SSR', async ({ page, request }) => {
      pageLoads.watch(page)

      await page.goto('/ssr/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      await page.getByTestId('navigate-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')

      await page.getByTestId('back-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      expect(pageLoads.count).toBe(1)

      // Verify SSR server is still healthy
      const response = await request.get(`http://localhost:${SSR_SERVER_PORT}/health`)
      const health = await response.json()
      expect(health.status).toBe('OK')
    })
  })
})

test.describe('Head title escaping', () => {
  test.beforeEach(() => {
    test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')
  })

  test('it escapes HTML in the title prop to prevent XSS in SSR output', async ({ page }) => {
    const response = await page.request.get('/ssr/head-with-xss-title')
    const html = await response.text()

    expect(html).not.toContain('</title><script>alert(')
    expect(html).toContain('&lt;/title&gt;&lt;script&gt;')
  })

  test('it runs the titleCallback with the page during SSR', async ({ page }) => {
    const response = await page.request.get('/ssr/head-title?withTitleCallback')
    const html = await response.text()

    expect(html).toContain('<title data-inertia="">SSR Head Title | From Props</title>')
  })
})

test.describe('server head', () => {
  test('it renders server-provided head elements in the SSR output', async ({ page }) => {
    const response = await page.request.get('/ssr/server-head')
    const html = await response.text()

    expect(html).toContain('<title data-inertia="title">Server Head SSR</title>')
    expect(html).toContain('<meta data-inertia="description" name="description" content="Rendered on the server">')
    expect(html).toContain('<link data-inertia="canonical" rel="canonical" href="https://example.com/ssr">')
    expect(html).toContain('Server head rendered on the server')
  })
})

test.describe('layout props', () => {
  test('it does not leak layout props between SSR requests', async ({ page, browserName }) => {
    const responseA = await page.request.get('/ssr/layout-props-a')
    const htmlA = await responseA.text()

    expect(htmlA).toContain('Page A Content')

    const responseB = await page.request.get('/ssr/layout-props-b')
    const htmlB = await responseB.text()

    expect(htmlB).toContain('Page B Content')
    expect(htmlB).toContain('Default Title')
    expect(htmlB).not.toContain('Page A Title')
  })

  test('it hydrates without errors after setLayoutProps was used in a previous SSR request', async ({
    page,
    browserName,
  }) => {
    consoleMessages.listen(page)

    await page.request.get('/ssr/layout-props-a')
    await page.goto('/ssr/layout-props-b')

    await expect(page.getByTestId('layout-title')).toHaveText('Default Title')
    await expect(page.getByTestId('page-content')).toHaveText('Page B Content')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it hydrates without errors on a page that uses layout tuple props', async ({ page, browserName }) => {
    consoleMessages.listen(page)

    await page.goto('/ssr/layout-props-a')

    await expect(page.getByTestId('page-content')).toHaveText('Page A Content')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it renders layout tuple props in SSR HTML', async ({ page, browserName }) => {
    const response = await page.request.get('/ssr/layout-props-a')
    const html = await response.text()

    expect(html).toContain('Page A Title')
    expect(html).toContain('Page A Content')
  })

  test('it supports a layout callback that receives page props during SSR', async ({ page, browserName }) => {
    const response = await page.request.get('/ssr/layout-props-callback')
    const html = await response.text()

    expect(html).toContain('Profile: Callback Title')
    expect(html).toContain('Callback Content')
  })

  test('it hydrates a layout callback page without errors', async ({ page, browserName }) => {
    consoleMessages.listen(page)

    await page.goto('/ssr/layout-props-callback')

    await expect(page.getByTestId('layout-title')).toHaveText('Profile: Callback Title')
    await expect(page.getByTestId('page-content')).toHaveText('Callback Content')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })
})

test.describe('SSR InfiniteScroll', () => {
  test('it renders correct slot props during SSR', async ({ page }) => {
    const response = await page.request.get('/ssr/infinite-scroll')
    const html = await response.text()

    expect(html).toMatch(/Has previous:.*false/)
    expect(html).toMatch(/Has next:.*true/)
  })

  test('it hydrates without mismatch', async ({ page }) => {
    consoleMessages.listen(page)

    await page.goto('/ssr/infinite-scroll')

    await expect(page.getByTestId('has-previous')).toHaveText('Has previous: false')
    await expect(page.getByTestId('has-next')).toHaveText('Has next: true')

    expect(consoleMessages.errors).toHaveLength(0)
  })
})

test.describe('SSR Auto Transform', () => {
  test.describe('Vite plugin SSR transform', () => {
    test('it renders HTML using the auto-transformed SSR entry', async ({ page }) => {
      const response = await page.request.get('/ssr-auto/page1')
      const html = await response.text()

      // Verify server-rendered content from the auto-transformed SSR entry
      expect(html).toContain('data-page=')
      expect(html).toMatch(/Name:.*Auto User/)
      expect(html).toMatch(/Email:.*auto@example\.com/)
      expect(html).toContain('Auto 1')
      expect(html).toContain('Auto 2')
      expect(html).toContain('Auto 3')
      expect(html).toMatch(/Count:.*100/)
      expect(html).toMatch(/URL:.*\/ssr-auto\/page1/)
    })

    test('it hydrates correctly after SSR with auto-transformed entry', async ({ page }) => {
      consoleMessages.listen(page)

      await page.goto('/ssr-auto/page1')

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')
      await expect(page.getByTestId('user-name')).toHaveText('Name: Auto User')
      await expect(page.getByTestId('count')).toHaveText('Count: 100')

      expect(consoleMessages.errors).toHaveLength(0)
    })

    test('it handles client-side navigation after auto SSR', async ({ page, request }) => {
      pageLoads.watch(page)

      await page.goto('/ssr-auto/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      await page.getByTestId('navigate-link').click()

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')
      await expect(page.getByTestId('navigated-status')).toHaveText('Navigated: true')
      expect(pageLoads.count).toBe(1)

      // Verify auto SSR server is healthy
      const response = await request.get(`http://localhost:${SSR_AUTO_SERVER_PORT}/health`)
      const health = await response.json()
      expect(health.status).toBe('OK')
    })

    test('it applies withApp callback during SSR rendering', async ({ page }) => {
      const response = await page.request.get('/ssr-auto/with-app')
      const html = await response.text()

      expect(html).toContain('SSR WithApp')
      expect(html).toMatch(/Value:.*injected-via-withApp/)
    })

    test('it passes page object to withApp callback during SSR rendering', async ({ page }) => {
      const response = await page.request.get('/ssr-auto/with-app')
      const html = await response.text()

      expect(html).toMatch(/Locale:.*en-CA/)
      expect(html).toMatch(/Component:.*SSR\/WithApp/)
    })

    test('it renders components with top-level await during SSR', async ({ page }) => {
      test.skip(process.env.SVELTE_ASYNC !== 'true', 'Requires the async Svelte compiler option')

      const response = await page.request.get('/ssr-auto/async')
      const html = await response.text()

      // Verify that the top-level await resolved correctly on the server
      expect(html).toContain('Async SSR Page')
      expect(html).toContain('Result: Hello from async SSR!')
    })

    test('it hydrates async components without mismatch after SSR', async ({ page }) => {
      test.skip(process.env.SVELTE_ASYNC !== 'true', 'Requires the async Svelte compiler option')

      consoleMessages.listen(page)

      await page.goto('/ssr-auto/async')

      await expect(page.getByTestId('async-ssr-title')).toHaveText('Async SSR Page')
      await expect(page.getByTestId('async-result')).toHaveText('Result: Hello from async SSR!')

      expect(consoleMessages.errors).toHaveLength(0)
    })
  })
})

test.describe('SSR layers', () => {
  test('it renders a cold layer inside its shell, over a base that is not there', async ({ page }) => {
    const response = await page.request.get('/ssr/layer')
    const html = await response.text()

    expect(html).toContain('<dialog open')
    expect(html).toContain('data-layer-index="0"')
    expect(html).toContain('SSR layer')
    expect(html).not.toContain('SSR layer base')
  })

  test('it renders a cold layer server head from the layer, not from the blank base beneath it', async ({ page }) => {
    const response = await page.request.get('/ssr/layer-head')
    const html = await response.text()

    expect(html).toContain('<title data-inertia="server-head-0">Layer Head SSR</title>')
    expect(html).toContain('<meta data-inertia="server-head-1" name="description" content="Layer head description">')
  })

  test('it renders a layer that remembers state, which the server has no history to write to', async ({ page }) => {
    const response = await page.request.get('/ssr/layer')

    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('data-testid="ssr-layer-note"')
  })

  test('it hands the client the layer response untouched, so the client walks the chain itself', async ({ page }) => {
    const response = await page.request.get('/ssr/layer')
    const html = await response.text()
    const embedded = html.match(/<script data-page="app" type="application\/json">(.*?)<\/script>/)![1]

    expect(JSON.parse(embedded.replace(/\\\//g, '/'))).toMatchObject({
      component: 'SSR/Layer',
      layer: { key: 'ssr-layer', base: '/ssr/layer-base' },
    })
  })

  test('it renders the loading placeholder into the document beneath a cold layer', async ({ page }) => {
    const response = await page.request.get('/ssr/layer-loading')
    const html = await response.text()

    expect(html).toContain('SSR layer')
    expect(html).toContain('SSR loading placeholder')
  })

  test('the placeholder hydrates in place, and the walk replaces it with the base', async ({ page }) => {
    consoleMessages.listen(page)

    await page.goto('/ssr/layer-loading', { waitUntil: 'commit' })

    await expect(page.locator('#loading-base')).toBeVisible()
    await expect(page.getByTestId('ssr-layer-base')).toBeVisible()
    await expect(page.locator('#loading-base')).toHaveCount(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it renders a cold layer from the auto-transformed SSR entry too', async ({ page }) => {
    const response = await page.request.get('/ssr-auto/layer')
    const html = await response.text()

    expect(html).toContain('<dialog open')
    expect(html).toContain('data-layer-index="0"')
    expect(html).toContain('SSR layer')
  })

  test('a cold layer url renders an open dialog that hydration upgrades to modal without throwing', async ({
    page,
  }) => {
    const response = await page.request.get('/ssr/layer')
    const html = await response.text()
    expect(html).toContain('<dialog open')

    consoleMessages.listen(page)

    await page.goto('/ssr/layer')

    await expect(page.locator('dialog[data-layer-index="0"]')).toBeVisible()
    await expect(page.evaluate(() => document.querySelector('dialog')?.matches(':modal'))).resolves.toBe(true)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it hydrates the layer it rendered rather than discarding and rebuilding it', async ({ page }) => {
    consoleMessages.listen(page)

    await page.addInitScript(() => {
      const holdsTheLayer = (node: Node) =>
        node instanceof Element &&
        (node.matches('[data-testid="ssr-layer"]') || !!node.querySelector('[data-testid="ssr-layer"]'))

      window.serverRenderedLayerWasRemoved = false

      new MutationObserver((records) => {
        records.forEach((record) => {
          record.removedNodes.forEach((node) => {
            window.serverRenderedLayerWasRemoved ||= holdsTheLayer(node)
          })
        })
      }).observe(document, { childList: true, subtree: true })
    })

    await page.goto('/ssr/layer')

    await expect(page.getByTestId('ssr-layer')).toBeVisible()
    await expect(page.getByTestId('ssr-layer-base')).toBeVisible()
    await expect(page.locator('[data-layer-index]')).toHaveCount(1)

    expect(await page.evaluate(() => window.serverRenderedLayerWasRemoved)).toBe(false)
    expect(consoleMessages.errors).toHaveLength(0)
  })
})
