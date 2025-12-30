import { expect, test } from '@playwright/test'
import { requests } from './support'

test('it does not trigger unnecessary reload when history state has no Inertia data', async ({ page }) => {
  await page.goto('/navigate-non-inertia')
  await expect(page.getByText('Navigate Non-Inertia')).toBeVisible()

  await page.click('a[href="/non-inertia"]')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Inertia app loaded')

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/navigate-non-inertia')
  await expect(page.getByText('Navigate Non-Inertia')).toBeVisible()

  const pageRequests = requests.requests.filter((r) => r.url().includes('/navigate-non-inertia'))
  expect(pageRequests.length).toBe(1)
})
