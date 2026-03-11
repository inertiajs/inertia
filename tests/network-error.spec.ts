import { expect, test } from '@playwright/test'

test.describe('network error', () => {
  test('it cleans up request stream after network failure', async ({ page }) => {
    await page.goto('/network-error')

    await page.route('**/network-error', async (route) => {
      if (route.request().headers()['x-inertia']) {
        await route.abort('failed')
      } else {
        await route.continue()
      }
    })

    await page.locator('#make-request').click()
    await expect(page.locator('#network-error')).toBeVisible()

    await page.waitForFunction(() => (window.testing.Inertia as any).syncRequestStream.requests.length === 0)
  })
})
