import { expect, test } from '@playwright/test'
import { consoleMessages, pageLoads } from './support'

const SSR_SERVER_PORT = 13714

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
    })

    test('hydrates correctly after initial SSR load', async ({ page }) => {
      consoleMessages.listen(page)

      await page.goto('/ssr/page1')

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')
      await expect(page.getByTestId('user-name')).toHaveText('Name: John Doe')
      await expect(page.getByTestId('count')).toHaveText('Count: 42')

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
