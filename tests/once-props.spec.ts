import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

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
  await page.goto('/once-props/deferred/a')

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

test('prefetch cache uses updated TTL after reload and serves cache within new expiry window', async ({ page }) => {
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/ttl/c'))

  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await prefetchPromise
  await page.waitForTimeout(2500)

  await page.getByRole('button', { name: 'Reload foo' }).click()
  await expect(page.getByText(initialFooText)).not.toBeVisible()

  const reloadedFooText = await page.locator('#foo').innerText()

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

test('prefetch cache is invalidated when updated TTL expires again', async ({ page }) => {
  test.setTimeout(10000)
  const prefetchPromise = page.waitForResponse((response) => response.url().includes('/once-props/ttl/c'))

  await page.goto('/once-props/ttl/a')

  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  const initialFooText = await page.locator('#foo').innerText()

  await prefetchPromise
  await page.waitForTimeout(2500)

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

  await page.goto('/once-props/deferred/a')

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
