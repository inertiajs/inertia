import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse, gotoPageAndWaitForContent } from './support'

test.beforeEach(async ({ page }) => {
  await page.goto('/once-props/page-a')
})

test('loads the prop on initial page load and then preserves it after navigation', async ({ page }) => {
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  await page.reload()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Foo: foo-b')).toBeVisible()
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
})

test('navigating back and forward preserves the prop', async ({ page }) => {
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  await page.goBack()

  await expect(page).toHaveURL('/once-props/page-a')
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.goForward()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
})

test('partial reload preserves the prop', async ({ page }) => {
  const fooText = await page.locator('#foo').innerText()

  await page.getByRole('button', { name: 'Reload (only foo)' }).click()
  await expect(page.getByText(fooText)).not.toBeVisible()

  const newFooText = await page.locator('#foo').innerText()

  expect(newFooText.startsWith('Foo: foo-a')).toBe(true)
  expect(newFooText).not.toBe(fooText)

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText(newFooText)).toBeVisible()
})

test('partial reload of one once prop preserves all once props on navigation', async ({ page }) => {
  await page.goto('/once-props/partial-reload/a')

  const fooText = await page.locator('#foo').innerText()
  const barText = await page.locator('#bar').innerText()

  expect(fooText.startsWith('Foo: foo-a')).toBe(true)
  expect(barText.startsWith('Bar: bar-a')).toBe(true)

  await page.getByRole('button', { name: 'Reload (only foo)' }).click()
  await expect(page.getByText(fooText)).not.toBeVisible()

  const newFooText = await page.locator('#foo').innerText()
  expect(newFooText.startsWith('Foo: foo-a')).toBe(true)
  expect(newFooText).not.toBe(fooText)

  await expect(page.getByText(barText)).toBeVisible()

  await page.getByRole('link', { name: 'Go to Partial Reload B' }).click()
  await expect(page).toHaveURL('/once-props/partial-reload/b')
  await expect(page.getByText(newFooText)).toBeVisible()
  await expect(page.getByText(barText)).toBeVisible()
})

test('navigating through an intermediary page without the once prop', async ({ page }) => {
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page C' }).click()

  await expect(page).toHaveURL('/once-props/page-c')

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-b')).toBeVisible()
})

test('deferred once prop is loaded via defer and then remembered on navigation', async ({ page }) => {
  await gotoPageAndWaitForContent(page, '/once-props/deferred/a')

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.waitForResponse(
    (response) =>
      response.url().includes('/once-props/deferred/a') &&
      response.request().headers()['x-inertia-partial-data'] === 'foo',
  )

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  const fooText = await page.locator('#foo').innerText()

  await clickAndWaitForResponse(page, 'Go to Deferred Page B', '/once-props/deferred/b')

  await expect(page).toHaveURL('/once-props/deferred/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText(fooText)).toBeVisible()
})

test('navigating before deferred+once prop loads preserves other once props and loads deferred+once prop on new page', async ({
  page,
}) => {
  await gotoPageAndWaitForContent(page, '/once-props/slow-deferred/a')

  await expect(page.locator('#bar')).toContainText('Bar: bar-a')
  await expect(page.locator('#foo-loading')).toBeVisible()

  const barText = await page.locator('#bar').innerText()

  await page.getByRole('link', { name: 'Go to Page B' }).click()
  await expect(page).toHaveURL('/once-props/slow-deferred/b')

  // bar should be preserved from page A (it was a once prop that was already loaded)
  await expect(page.locator('#bar')).toContainText(barText)

  // foo should be loaded via defer on page B since we didn't have it on page A
  await expect(page.locator('#foo-loading')).toBeVisible()
  await expect(page.locator('#foo')).toContainText('Foo: foo-b')

  const fooText = await page.locator('#foo').innerText()

  // Navigate back to page A
  await page.getByRole('link', { name: 'Go to Page A' }).click()
  await expect(page).toHaveURL('/once-props/slow-deferred/a')

  // bar should still be preserved, as well as foo now since it was loaded on page B
  await expect(page.locator('#foo')).toContainText(fooText)
  await expect(page.locator('#bar')).toContainText(barText)
})

test('once prop with TTL is remembered within TTL window and reloaded after expiry', async ({ page }) => {
  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  const initialFooText = await page.locator('#foo').innerText()

  await page.getByRole('link', { name: 'Go to TTL Page B' }).click()

  await expect(page).toHaveURL('/once-props/ttl/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText(initialFooText)).toBeVisible()

  await page.getByRole('link', { name: 'Go to TTL Page A' }).click()

  await expect(page).toHaveURL('/once-props/ttl/a')
  await expect(page.getByText(initialFooText)).toBeVisible()

  await page.waitForTimeout(2500)

  await page.getByRole('link', { name: 'Go to TTL Page B' }).click()

  await expect(page).toHaveURL('/once-props/ttl/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()

  const newFooText = await page.locator('#foo').innerText()
  expect(newFooText).not.toBe(initialFooText)
  expect(newFooText.startsWith('Foo: foo-b')).toBe(true)
})

test('once prop with TTL has its expiry reset after reload', async ({ page }) => {
  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await page.waitForTimeout(2500)

  await page.getByRole('button', { name: 'Reload foo' }).click()
  await expect(page.getByText(initialFooText)).not.toBeVisible()

  const reloadedFooText = await page.locator('#foo').innerText()
  expect(reloadedFooText).not.toBe(initialFooText)
  expect(reloadedFooText.startsWith('Foo: foo-a')).toBe(true)

  await page.getByRole('link', { name: 'Go to TTL Page B' }).click()

  await expect(page).toHaveURL('/once-props/ttl/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText(reloadedFooText)).toBeVisible()
})

test('once prop TTL is preserved across navigation and expires correctly', async ({ page }) => {
  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await page.waitForTimeout(1000)

  await page.getByRole('link', { name: 'Go to TTL Page B' }).click()
  await expect(page).toHaveURL('/once-props/ttl/b')
  await expect(page.getByText(initialFooText)).toBeVisible()

  await page.waitForTimeout(1500)

  await page.getByRole('link', { name: 'Go to TTL Page A' }).click()
  await expect(page).toHaveURL('/once-props/ttl/a')

  const newFooText = await page.locator('#foo').innerText()
  expect(newFooText).not.toBe(initialFooText)
  expect(newFooText.startsWith('Foo: foo-a')).toBe(true)
})

test('optional once prop is not loaded initially, fetched via reload, then cached on navigation', async ({ page }) => {
  await page.goto('/once-props/optional/a')

  await expect(page.getByText('Foo: not loaded')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load foo', '/once-props/optional/a', 'button')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  const fooText = await page.locator('#foo').innerText()
  expect(fooText.startsWith('Foo: foo-a')).toBe(true)

  await clickAndWaitForResponse(page, 'Go to Optional Page B', '/once-props/optional/b')

  await expect(page).toHaveURL('/once-props/optional/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText(fooText)).toBeVisible()

  await clickAndWaitForResponse(page, 'Go to Optional Page A', '/once-props/optional/a')

  await expect(page).toHaveURL('/once-props/optional/a')
  await expect(page.getByText(fooText)).toBeVisible()
})

test('merge once prop merges on reload and preserves merged data on navigation', async ({ page }) => {
  await page.goto('/once-props/merge/a')

  await expect(page.getByText('Items count: 3')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load more items', '/once-props/merge/a', 'button')

  await expect(page.getByText('Items count: 6')).toBeVisible()

  await clickAndWaitForResponse(page, 'Go to Merge Page B', '/once-props/merge/b')

  await expect(page).toHaveURL('/once-props/merge/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Items count: 6')).toBeVisible()

  await clickAndWaitForResponse(page, 'Go to Merge Page A', '/once-props/merge/a')

  await expect(page).toHaveURL('/once-props/merge/a')
  await expect(page.getByText('Items count: 6')).toBeVisible()
})

test('once prop with custom key shares data across pages with different prop names', async ({ page }) => {
  await page.goto('/once-props/custom-key/a')

  await expect(page.getByText('Permissions: perms-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  const permissionsText = await page.locator('#permissions').innerText()

  await page.getByRole('link', { name: 'Go to Custom Key Page B' }).click()

  await expect(page).toHaveURL('/once-props/custom-key/b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText(permissionsText)).toBeVisible()

  await page.getByRole('link', { name: 'Go to Custom Key Page A' }).click()

  await expect(page).toHaveURL('/once-props/custom-key/a')
  await expect(page.getByText(permissionsText)).toBeVisible()
})

test('prefetched once prop is preserved after navigating through intermediary page', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/page-d'))

  await page.goto('/once-props/page-a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  const fooText = await page.locator('#foo').innerText()

  await prefetchPromise

  await page.getByRole('link', { name: 'Go to Page C' }).click()
  await expect(page).toHaveURL('/once-props/page-c')

  await page.getByRole('link', { name: 'Go to Page D' }).click()
  await expect(page).toHaveURL('/once-props/page-d')

  await expect(page.getByText(fooText)).toBeVisible()
})

test('prefetched once prop is updated when re-prefetched before use', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/page-d'))

  await page.goto('/once-props/page-a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  const fooText = await page.locator('#foo').innerText()

  await prefetchPromise

  await page.getByRole('button', { name: 'Reload (only foo)' }).click()
  await expect(page.getByText(fooText)).not.toBeVisible()

  const newFooText = await page.locator('#foo').innerText()

  expect(newFooText.startsWith('Foo: foo-a')).toBe(true)
  expect(newFooText).not.toBe(fooText)

  await page.getByRole('link', { name: 'Go to Page D' }).click()
  await expect(page).toHaveURL('/once-props/page-d')

  await expect(page.getByText(newFooText)).toBeVisible()
})

test('prefetch cache TTL is extended when once prop is reloaded before expiry', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/ttl/c'))

  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await prefetchPromise

  await page.getByRole('button', { name: 'Reload foo' }).click()
  await expect(page.getByText(initialFooText)).not.toBeVisible()

  const reloadedFooText = await page.locator('#foo').innerText()

  await page.waitForTimeout(1500)

  let requestMade = false
  page.on('request', (request) => {
    if (request.url().includes('/once-props/ttl/c')) {
      requestMade = true
    }
  })

  await page.getByRole('link', { name: 'Go to TTL Page C' }).click()
  await expect(page).toHaveURL('/once-props/ttl/c')

  expect(requestMade).toBe(false)
  await expect(page.getByText(reloadedFooText)).toBeVisible()
})

test('prefetch cache is invalidated when extended TTL expires', async ({ page }) => {
  test.setTimeout(10000)
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/ttl/c'))

  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await prefetchPromise

  await page.getByRole('button', { name: 'Reload foo' }).click()
  await expect(page.getByText(initialFooText)).not.toBeVisible()

  const reloadedFooText = await page.locator('#foo').innerText()

  await page.waitForTimeout(2500)

  await page.getByRole('link', { name: 'Go to TTL Page C' }).click()
  await expect(page).toHaveURL('/once-props/ttl/c')

  const newFooText = await page.locator('#foo').innerText()
  expect(newFooText).not.toBe(reloadedFooText)
  expect(newFooText.startsWith('Foo: foo-c')).toBe(true)
})

test('prefetched once prop with TTL is refreshed after expiry', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/ttl/c'))

  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await prefetchPromise
  await page.waitForTimeout(2500)

  await page.getByRole('link', { name: 'Go to TTL Page C' }).click()
  await expect(page).toHaveURL('/once-props/ttl/c')

  const newFooText = await page.locator('#foo').innerText()
  expect(newFooText).not.toBe(initialFooText)
  expect(newFooText.startsWith('Foo: foo-c')).toBe(true)
})

test('prefetch cache is updated when deferred once prop finishes loading', async ({ page }) => {
  const prefetchPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/once-props/deferred/c') && !response.request().headers()['x-inertia-partial-data'],
  )

  await gotoPageAndWaitForContent(page, '/once-props/deferred/a')

  await expect(page.getByText('Loading foo...')).toBeVisible()

  await prefetchPromise

  await page.waitForResponse(
    (response) =>
      response.url().includes('/once-props/deferred/a') &&
      response.request().headers()['x-inertia-partial-data'] === 'foo',
  )

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  const fooText = await page.locator('#foo').innerText()
  expect(fooText.startsWith('Foo: foo-a')).toBe(true)

  await page.getByRole('link', { name: 'Go to Deferred Page C' }).click()
  await expect(page).toHaveURL('/once-props/deferred/c')

  await expect(page.getByText(fooText)).toBeVisible()
})

test('prefetch cache is updated when replaceProp is called', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/page-d'))

  await page.goto('/once-props/page-a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  await prefetchPromise

  await page.getByRole('button', { name: 'Replace foo' }).click()

  await expect(page.getByText('Foo: replaced-foo')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page D' }).click()
  await expect(page).toHaveURL('/once-props/page-d')

  await expect(page.getByText('Foo: replaced-foo')).toBeVisible()
})

test('prefetch cache expires based on cacheFor even when once prop has no TTL', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/page-e'))

  await page.goto('/once-props/page-a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const fooText = await page.locator('#foo').innerText()

  await prefetchPromise

  await page.waitForTimeout(1500)

  let requestMade = false
  page.on('request', (request) => {
    if (request.url().includes('/once-props/page-e')) {
      requestMade = true
    }
  })

  await page.getByRole('link', { name: 'Go to Page E (short cache)' }).click()
  await expect(page).toHaveURL('/once-props/page-e')

  expect(requestMade).toBe(true)
  await expect(page.getByText('Bar: bar-e')).toBeVisible()
  await expect(page.getByText(fooText)).toBeVisible()
})
