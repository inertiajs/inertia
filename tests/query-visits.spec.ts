import test, { expect } from '@playwright/test'
import { pageLoads, requests } from './support'

test('it reloads a page rendered by a QUERY visit with the same request body', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/query-visits/search')
  await expect(page.locator('#term')).toHaveText('Term: nothing')
  await expect(page.locator('#results')).toHaveText('Results for: nothing')

  const deferredRequest = page.waitForRequest(
    (request) => request.method() === 'QUERY' && !!request.headers()['x-inertia-partial-data'],
  )
  await page.getByRole('button', { name: 'Search Apple' }).click()

  await expect(page.locator('#term')).toHaveText('Term: apple')
  expect((await deferredRequest).postDataJSON()).toEqual({ term: 'apple' })
  await expect(page.locator('#results')).toHaveText('Results for: apple')

  const reloadRequest = page.waitForRequest((request) => request.method() === 'QUERY')
  await page.getByRole('button', { name: 'Reload', exact: true }).click()

  expect((await reloadRequest).postDataJSON()).toEqual({ term: 'apple' })
  await expect(page.locator('#reloaded-at')).not.toHaveText('Reloaded at: never')
  await expect(page.locator('#term')).toHaveText('Term: apple')

  await page.getByRole('link', { name: 'Leave' }).click()
  await expect(page).toHaveURL('/dump/get')
  await page.goBack()
  await expect(page.locator('#term')).toHaveText('Term: apple')

  const reloadAfterBackRequest = page.waitForRequest((request) => request.method() === 'QUERY')
  await page.getByRole('button', { name: 'Reload', exact: true }).click()

  expect((await reloadAfterBackRequest).postDataJSON()).toEqual({ term: 'apple' })
  await expect(page.locator('#term')).toHaveText('Term: apple')
})

test('it keeps reload data and drops the QUERY data when leaving the page client side', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/query-visits/search')
  await page.getByRole('button', { name: 'Search Apple' }).click()
  await expect(page.locator('#term')).toHaveText('Term: apple')

  await page.getByRole('button', { name: 'Reload with Cherry' }).click()
  await expect(page.locator('#term')).toHaveText('Term: cherry')

  const reloadRequest = page.waitForRequest((request) => request.method() === 'QUERY')
  await page.getByRole('button', { name: 'Reload', exact: true }).click()

  expect((await reloadRequest).postDataJSON()).toEqual({ term: 'cherry' })
  await expect(page.locator('#term')).toHaveText('Term: cherry')

  await page.getByRole('button', { name: 'Push elsewhere' }).click()
  await expect(page).toHaveURL('/query-visits/search-elsewhere')

  const reloadElsewhereRequest = page.waitForRequest((request) =>
    request.url().includes('/query-visits/search-elsewhere'),
  )
  await page.getByRole('button', { name: 'Reload', exact: true }).click()

  expect((await reloadElsewhereRequest).method()).toBe('GET')
})

test('it cancels a pending reload when a new QUERY visit starts on the same page', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/query-visits/search')
  await page.getByRole('button', { name: 'Search Apple' }).click()
  await expect(page.locator('#term')).toHaveText('Term: apple')

  const slowReload = page.waitForEvent('requestfailed', (request) => !!request.headers()['x-slow'])
  await page.getByRole('button', { name: 'Slow reload' }).click()
  await page.getByRole('button', { name: 'Search Banana' }).click()

  await slowReload
  await expect(page.locator('#term')).toHaveText('Term: banana')
  await expect(page.locator('#results')).toHaveText('Results for: banana')
  await expect(page.locator('#reloaded-at')).toHaveText('Reloaded at: never')
})

test('it loads more infinite scroll items with the QUERY request body', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/query-visits/infinite-scroll')
  await expect(page.getByText('Any User 1', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Search Apple' }).click()
  await expect(page.locator('#term')).toHaveText('Term: Apple')
  await expect(page.getByText('Apple User 1', { exact: true })).toBeVisible()

  requests.listen(page)

  await page.getByRole('button', { name: 'Load next items' }).click()
  await expect(page.getByText('Apple User 16')).toBeVisible()
  await expect(page.getByText('Any User 16')).toBeHidden()

  const nextPageRequest = requests.requests.find((request) => request.method() === 'QUERY')

  expect(nextPageRequest?.postDataJSON()).toEqual({ term: 'Apple', page: 2 })
})
