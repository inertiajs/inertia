import { test } from '@playwright/test'

test.describe('redirectBack option', () => {
  test('does not follow server redirect when redirectBack is set', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) => response.request().headers()['x-inertia-redirect-back'] === 'true' && response.status() === 303,
    )

    await page.goto('/redirect-back')
    await page.getByRole('button', { name: 'Submit with redirectBack' }).click()
    await responsePromise

    await page.waitForTimeout(100) // Wait a moment for any potential navigation
    await page.waitForURL('/redirect-back')
  })

  test('follows server redirect when redirectBack is not set', async ({ page }) => {
    await page.goto('/redirect-back')
    await page.getByRole('button', { name: 'Submit without redirectBack' }).click()
    await page.waitForURL('/')
  })
})
