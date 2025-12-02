import { expect, test } from '@playwright/test'
import { consoleMessages, pageLoads } from './support'

const SSR_SERVER_PORT = 13714

test.describe('SSR', () => {
  test.describe('initial page load', () => {
    test('renders HTML with props on the server', async ({ page }) => {
      const response = await page.request.get('/ssr/page1')
      const html = await response.text()

      // Verify server-rendered content (using regex to handle React's comment nodes)
      expect(html).toContain('data-page=')
      expect(html).toMatch(/Name:.*John Doe/)
      expect(html).toMatch(/Email:.*john@example\.com/)
      expect(html).toContain('Item 1')
      expect(html).toContain('Item 2')
      expect(html).toContain('Item 3')
      expect(html).toMatch(/Count:.*42/)
    })

    test('hydrates correctly after initial SSR load', async ({ page }) => {
      consoleMessages.listen(page)
      pageLoads.watch(page)

      await page.goto('/ssr/page1')

      // Verify the page rendered correctly
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')
      await expect(page.getByTestId('user-name')).toHaveText('Name: John Doe')
      await expect(page.getByTestId('count')).toHaveText('Count: 42')

      // Check for hydration errors
      const hydrationErrors = consoleMessages.errors.filter(
        (msg) => msg.includes('hydration') || msg.includes('mismatch'),
      )
      expect(hydrationErrors).toHaveLength(0)
    })
  })

  test.describe('client-side navigation', () => {
    test('navigates without full page reload after SSR', async ({ page }) => {
      pageLoads.watch(page)
      consoleMessages.listen(page)

      // Initial SSR load
      await page.goto('/ssr/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      // Navigate to another page (should be client-side)
      await page.getByTestId('navigate-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')
      await expect(page.getByTestId('navigated-status')).toHaveText('Navigated: true')

      // Verify no additional page loads occurred (SPA behavior)
      expect(pageLoads.count).toBe(1)
    })

    test('subsequent navigation uses JSON responses', async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/ssr/page1')

      // Set up request listener before navigation
      let jsonResponseReceived = false
      page.on('response', async (response) => {
        if (response.url().includes('/ssr/page2')) {
          const headers = response.headers()
          if (headers['x-inertia'] === 'true') {
            jsonResponseReceived = true
          }
        }
      })

      // Navigate
      await page.getByTestId('navigate-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')

      // Verify the response was JSON (X-Inertia header)
      expect(jsonResponseReceived).toBe(true)
    })

    test('can navigate back and forth after SSR', async ({ page, request }) => {
      pageLoads.watch(page)

      await page.goto('/ssr/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      // Navigate forward
      await page.getByTestId('navigate-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')

      // Navigate back using Inertia link
      await page.getByTestId('back-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      // All navigation should be client-side
      expect(pageLoads.count).toBe(1)

      // Verify SSR server is still healthy after all the navigation
      const response = await request.get(`http://localhost:${SSR_SERVER_PORT}/health`)
      const health = await response.json()
      expect(health.status).toBe('OK')
    })
  })
})
