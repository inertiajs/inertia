import { expect, test } from '@playwright/test'
import { pageLoads, requests } from './support'

test('it will wait to fire the reload until element is visible', async ({ page }) => {
  await page.goto('/when-visible')
  requests.listen(page)

  await page.evaluate(() => (window as any).scrollTo(0, 1000))
  await expect(requests.requests).toHaveLength(0)

  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(requests.requests).toHaveLength(0)

  await page.evaluate(() => (window as any).scrollTo(0, 5000))
  await expect(page.getByText('Loading first one...')).toBeVisible()
  await expect(page.getByText('First one is visible!')).not.toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading first one...')).not.toBeVisible()
  await expect(page.getByText('First one is visible!')).toBeVisible()

  // Scroll back up and then back down, make sure we don't re-request
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(requests.requests).toHaveLength(1)

  await page.evaluate(() => (window as any).scrollTo(0, 5000))
  await expect(requests.requests).toHaveLength(1)
  await expect(page.getByText('First one is visible!')).toBeVisible()

  requests.listen(page)

  await page.evaluate(() => (window as any).scrollTo(0, 6000))
  await expect(requests.requests).toHaveLength(0)

  // This one has a buffer of 1000
  await page.evaluate(() => (window as any).scrollTo(0, 9000))
  await expect(page.getByText('Loading second one...')).toBeVisible()
  await expect(page.getByText('Second one is visible!')).not.toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading second one...')).not.toBeVisible()
  await expect(page.getByText('Second one is visible!')).toBeVisible()

  // This one should trigger every time it's visible
  await page.evaluate(() => (window as any).scrollTo(0, 15_000))
  await expect(page.getByText('Loading third one...')).toBeVisible()
  await expect(page.getByText('Third one is visible!')).not.toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading third one...')).not.toBeVisible()
  await expect(page.getByText('Third one is visible!')).toBeVisible()

  // Now scroll up and down to re-trigger it
  await page.evaluate(() => (window as any).scrollTo(0, 13_000))
  await page.waitForTimeout(100)

  await page.evaluate(() => (window as any).scrollTo(0, 15_000))
  await expect(page.getByText('Third one is visible!')).toBeVisible()
  await page.waitForResponse(page.url())

  await page.evaluate(() => (window as any).scrollTo(0, 13_000))
  await page.waitForTimeout(100)

  await page.evaluate(() => (window as any).scrollTo(0, 15_000))
  await expect(page.getByText('Third one is visible!')).toBeVisible()
  await page.waitForResponse(page.url())

  await page.evaluate(() => (window as any).scrollTo(0, 20_000))
  await expect(page.getByText('Loading fourth one...')).toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading fourth one...')).not.toBeVisible()

  await page.evaluate(() => (window as any).scrollTo(0, 26_000))
  await expect(page.getByText('Loading fifth one...')).toBeVisible()
  await page.waitForResponse(page.url() + '?count=0')
  await expect(page.getByText('Loading fifth one...')).not.toBeVisible()
  await expect(page.getByText('Count is now 1')).toBeVisible()

  // Now scroll up and down to re-trigger it
  await page.evaluate(() => (window as any).scrollTo(0, 20_000))
  await page.waitForTimeout(100)

  await page.evaluate(() => (window as any).scrollTo(0, 26_000))
  await expect(page.getByText('Count is now 1')).toBeVisible()
  await page.waitForResponse(page.url() + '?count=1')
  await expect(page.getByText('Count is now 2')).toBeVisible()
})

test('it will reload again when the prop value is set to undefined (e.g. page reload)', async ({ page }) => {
  await page.goto('/when-visible-reload')
  requests.listen(page)

  // Initial load - lazyData should be missing
  await expect(page.getByText('This is lazy loaded data!')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(page.getByText('Loading lazy data...')).toBeVisible()

  // Wait for lazy data to load
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  await expect(page.getByText('This is lazy loaded data!')).toBeVisible()

  await page.evaluate(() => (window as any).scrollTo(0, 0))

  // Click the reload button to trigger the issue
  await page.getByRole('button', { name: 'Reload Page' }).click()

  // Lazily loaded data should be missing again after reload
  await expect(page.getByText('Loading lazy data...')).toBeVisible()
  await expect(page.getByText('This is lazy loaded data!')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component again
  await page.evaluate(() => (window as any).scrollTo(0, 3000))

  // Wait for lazy data to load again
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  await expect(page.getByText('This is lazy loaded data!')).toBeVisible()
})

test('it handles array props correctly with router.reload()', async ({ page }) => {
  await page.goto('/when-visible-array-reload')
  requests.listen(page)

  // Initial load - array data should be missing
  await expect(page.getByText('First lazy data loaded!')).not.toBeVisible()
  await expect(page.getByText('Second lazy data loaded!')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(page.getByText('Loading array data...')).toBeVisible()

  // Wait for array data to load
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading array data...')).not.toBeVisible()
  await expect(page.getByText('First lazy data loaded!')).toBeVisible()
  await expect(page.getByText('Second lazy data loaded!')).toBeVisible()

  await page.evaluate(() => (window as any).scrollTo(0, 0))

  // Click the reload button to trigger the issue
  await page.getByRole('button', { name: 'Reload Page' }).click()

  // Array data should be missing again after reload
  await expect(page.getByText('Loading array data...')).toBeVisible()
  await expect(page.getByText('First lazy data loaded!')).not.toBeVisible()
  await expect(page.getByText('Second lazy data loaded!')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component again
  await page.evaluate(() => (window as any).scrollTo(0, 3000))

  // Wait for array data to load again
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading array data...')).not.toBeVisible()
  await expect(page.getByText('First lazy data loaded!')).toBeVisible()
  await expect(page.getByText('Second lazy data loaded!')).toBeVisible()
})

test('it shows loaded content immediately when data exists from history (back button)', async ({ page }) => {
  await page.goto('/when-visible-back-button')
  pageLoads.watch(page)
  requests.listen(page)

  await expect(page.getByText('This is lazy loaded data!')).not.toBeVisible()

  await page.evaluate(() => (window as any).scrollTo(0, 2000))
  await expect(page.getByText('Loading lazy data...')).toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  await expect(page.getByText('This is lazy loaded data!', { exact: true })).toBeVisible()

  // Navigate away and back
  await page.evaluate(() => (window as any).scrollTo(0, 0))
  await page.getByRole('link', { name: 'Navigate Away' }).click()
  await page.waitForURL('/links/method')
  await page.goBack()
  await page.waitForURL('/when-visible-back-button')

  // Data exists from history, should show immediately without making a request
  requests.listen(page)
  await expect(page.getByText('This is lazy loaded data!', { exact: true })).toBeVisible()
  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  expect(requests.requests).toHaveLength(0)
})

test('it re-triggers when always prop is set after back button navigation', async ({ page }) => {
  await page.goto('/when-visible-back-button')
  pageLoads.watch(page)

  // Scroll to the always component and load data
  await page.evaluate(() => (window as any).scrollTo(0, 4000))
  await expect(page.getByText('Loading always data...')).toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Always: This is lazy loaded data!')).toBeVisible()

  // Navigate away and back
  await page.evaluate(() => (window as any).scrollTo(0, 0))
  await page.getByRole('link', { name: 'Navigate Away' }).click()
  await page.waitForURL('/links/method')
  await page.goBack()
  await page.waitForURL('/when-visible-back-button')
  await expect(page.getByText('Always: This is lazy loaded data!')).toBeVisible()

  // Scroll to trigger the always component again, should re-fetch
  await page.evaluate(() => (window as any).scrollTo(0, 4000))
  const response = await page.waitForResponse(
    (res) =>
      res.url().includes('/when-visible-back-button') &&
      res.request().headers()['x-inertia-partial-data'] !== undefined,
  )
  expect(response.status()).toBe(200)
})

test('it exposes fetching state to the default slot', async ({ page }) => {
  await page.goto('/when-visible-fetching')

  await page.evaluate(() => (window as any).scrollTo(0, 5000))
  await expect(page.getByText('Loading lazy data...')).toBeVisible()
  await expect(page.getByText('Lazy data loaded!')).not.toBeVisible()

  await page.waitForResponse(page.url())
  await page.evaluate(() => (window as any).scrollTo(0, 0))
  await page.waitForTimeout(100)

  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  await expect(page.getByText('Lazy data loaded!')).toBeVisible()
  await expect(page.getByText('Fetching in background...')).not.toBeVisible()

  // Scroll back to trigger re-fetch, content stays visible while fetching
  await page.evaluate(() => (window as any).scrollTo(0, 5000))
  await expect(page.getByText('Lazy data loaded!')).toBeVisible()
  await expect(page.getByText('Fetching in background...')).toBeVisible()

  await page.waitForResponse(page.url())
  await page.evaluate(() => (window as any).scrollTo(0, 0))
  await page.waitForTimeout(100)
  await expect(page.getByText('Lazy data loaded!')).toBeVisible()
  await expect(page.getByText('Fetching in background...')).not.toBeVisible()
})

test('it merges data and params props', async ({ page }) => {
  await page.goto('/when-visible-merge-params')

  // Using only the data prop works as before
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(page.getByText('Loading data only...')).toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Data only loaded: Data only success!')).toBeVisible()

  // Using both data and params merges them - data sets 'only', params.data becomes query string
  await page.evaluate(() => (window as any).scrollTo(0, 8000))
  await expect(page.getByText('Loading merged...')).toBeVisible()
  await page.waitForResponse((res) => res.url().includes('extra=from-params'))
  await expect(page.getByText('Merged loaded: Merged success! extra=from-params')).toBeVisible()

  // Other params options like preserveUrl are also passed through
  await page.evaluate(() => (window as any).scrollTo(0, 13500))
  await expect(page.getByText('Loading merged with callback...')).toBeVisible()
  await page.waitForResponse((res) => res.url().includes('page=2'))
  await expect(page.getByText('Merged with callback loaded: Merged with callback success! page=2')).toBeVisible()
})

test('it does not trigger unneeded requests when params change while visible', async ({ page }) => {
  await page.goto('/when-visible-params-update')

  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(page.getByText('Loading lazy data...')).toBeVisible()
  await page.waitForResponse((res) => res.url().includes('paramValue=initial'))
  await expect(page.getByText('Data loaded: Loaded with paramValue=initial')).toBeVisible()
  await page.waitForTimeout(100)

  requests.listen(page)

  await page.getByRole('button', { name: 'Update Param' }).click()
  await expect(page.getByText('Current param: updated')).toBeVisible()
  await page.waitForTimeout(100)

  expect(requests.requests).toHaveLength(0)
})
