import { test, expect } from '@playwright/test'

test.describe('network error', () => {
  test('cleans up request stream after network failure', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (err) => pageErrors.push(err.message))

    await page.goto('/network-error')

    await page.route('**/network-error', async (route) => {
      if (route.request().headers()['x-inertia']) {
        await route.abort('failed')
      } else {
        await route.continue()
      }
    })

    await page.locator('#make-request').click()
    await page.waitForTimeout(300)

    expect(pageErrors).toHaveLength(0)

    await page.unroute('**/network-error')

    await page.locator('#make-request').click()
    await expect(page.locator('#status')).toHaveText('ok')
  })
})
