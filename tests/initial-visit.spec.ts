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

test('it handles back/forward navigation between Inertia and non-Inertia pages correctly', async ({ page }) => {
  await page.goto('/non-inertia')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Inertia app loaded')

  await page.click('a[href="/navigate-non-inertia"]')
  await expect(page.getByText('Navigate Non-Inertia')).toBeVisible()

  await page.click('a[href="/non-inertia"]')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Inertia app loaded')

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/navigate-non-inertia')
  await expect(page.getByText('Navigate Non-Inertia')).toBeVisible()

  await page.goBack()
  await page.waitForURL('/non-inertia')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Inertia app loaded')

  await page.goForward()
  await page.waitForURL('/navigate-non-inertia')
  await expect(page.getByText('Navigate Non-Inertia')).toBeVisible()

  const inertiaRequests = requests.requests.filter(
    (r) => r.url().includes('/navigate-non-inertia') && r.headers()['x-inertia'] === 'true',
  )
  expect(inertiaRequests.length).toBe(0)
})
