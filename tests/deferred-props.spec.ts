import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse, consoleMessages } from './support'

test('can load deferred props', async ({ page }) => {
  await page.goto('/deferred-props/page-1')

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()
  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()

  await clickAndWaitForResponse(page, 'Page 2', '/deferred-props/page-2')

  await expect(page.getByText('Loading baz...')).toBeVisible()
  await expect(page.getByText('Loading qux...')).toBeVisible()
  await expect(page.getByText('Loading baz and qux...')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading baz...')).not.toBeVisible()
  await expect(page.getByText('Loading qux...')).toBeVisible()
  await expect(page.getByText('Loading baz and qux...')).toBeVisible()
  await expect(page.getByText('baz value')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading baz...')).not.toBeVisible()
  await expect(page.getByText('Loading qux...')).not.toBeVisible()
  await expect(page.getByText('Loading baz and qux...')).not.toBeVisible()
  await expect(page.getByText('baz value')).toBeVisible()
  await expect(page.getByText('qux value')).toBeVisible()
  await expect(page.getByText('both baz value and qux value')).toBeVisible()
})

test('we are not caching deferred props after reload', async ({ page }) => {
  await page.goto('/deferred-props/page-1')

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()
  await expect(page.getByText('foo value')).not.toBeVisible()
  await expect(page.getByText('bar value')).not.toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()
  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()

  await page.reload()

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()
  await expect(page.getByText('foo value')).not.toBeVisible()
  await expect(page.getByText('bar value')).not.toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()
  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()
})

test('props will re-defer if a link is clicked to go to the same page again', async ({ page }) => {
  await page.goto('/deferred-props/page-1')

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()
  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()

  await clickAndWaitForResponse(page, 'Page 1', '/deferred-props/page-1')

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()
  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()
})

const shoulReload = ['only']

shoulReload.forEach((type) => {
  test(`it will handle partial reloads properly when deferred is being reloaded (${type})`, async ({ page }) => {
    test.skip(process.env.PACKAGE !== 'react', 'React only test')

    await page.goto(`/deferred-props/with-partial-reload/${type}`)

    await expect(page.getByText('Loading...')).toBeVisible()

    await page.waitForResponse(page.url())

    await expect(page.getByText('Loading...')).not.toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()

    const responsePromise = page.waitForResponse(page.url())

    await page.getByRole('button', { exact: true, name: 'Trigger a partial reload' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await responsePromise

    await expect(page.getByText('John Doe')).toBeVisible()
  })
})

const noReload = ['except', 'only-other', 'none', 'except-other']

noReload.forEach((type) => {
  test(`it will handle partial reloads properly when deferred is not reloaded (${type})`, async ({ page }) => {
    test.skip(process.env.PACKAGE !== 'react', 'React only test')

    await page.goto(`/deferred-props/with-partial-reload/${type}`)

    await expect(page.getByText('Loading...')).toBeVisible()

    await page.waitForResponse(page.url())

    await expect(page.getByText('Loading...')).not.toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()

    const responsePromise = page.waitForResponse(page.url())
    await page.getByRole('button', { exact: true, name: 'Trigger a partial reload' }).click()
    await expect(page.getByText('Loading...')).not.toBeVisible()

    await responsePromise

    await expect(page.getByText('John Doe')).toBeVisible()
  })
})

test('it will not revert to fallback when fetching a url that is different than the current page', async ({ page }) => {
  test.skip(process.env.PACKAGE !== 'react', 'React only test')

  await page.goto(`/deferred-props/with-partial-reload/only`)

  await expect(page.getByText('Loading...')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading...')).not.toBeVisible()
  await expect(page.getByText('John Doe')).toBeVisible()

  const responsePromise = page.waitForResponse('/deferred-props/page-1')

  await page.getByRole('link', { name: 'Prefetch' }).hover()

  await page.waitForTimeout(100)

  await expect(page.getByText('Loading...')).not.toBeVisible()

  await responsePromise

  await expect(page.getByText('John Doe')).toBeVisible()
})

test('load deferred props in multiple groups', async ({ page }) => {
  const props = ['foo', 'bar', 'baz', 'qux', 'quux']

  await page.goto('/deferred-props/many-groups')

  for (const prop of props) {
    await expect(page.getByText(`Loading ${prop}...`)).toBeVisible()
  }

  for (const prop of props) {
    await page.waitForResponse(
      (response) => response.request().headers()['x-inertia-partial-data'] === prop && response.status() === 200,
    )
  }

  for (const prop of props) {
    await expect(page.getByText(`${prop} value`)).toBeVisible()
  }
})

test('load deferred props with partial reload on mount', async ({ page }) => {
  await page.goto('/deferred-props/instant-reload')

  await expect(page.getByText('Loading bar...')).toBeVisible()

  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()
})

test('can partial reload deferred props independently', async ({ page }) => {
  await page.goto('/deferred-props/partial-reloads')

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()

  // Capture initial timestamps
  const initialFooTimestamp = await page.locator('#foo-timestamp').textContent()
  const initialBarTimestamp = await page.locator('#bar-timestamp').textContent()

  expect(initialFooTimestamp).toBeTruthy()
  expect(initialBarTimestamp).toBeTruthy()

  const responsePromise = page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'foo' && response.status() === 200,
  )

  await page.getByRole('button', { name: 'Reload foo only' }).click()
  await responsePromise

  // Check that only foo changed
  const newFooTimestamp = await page.locator('#foo-timestamp').textContent()
  const newBarTimestamp = await page.locator('#bar-timestamp').textContent()

  expect(newFooTimestamp).not.toBe(initialFooTimestamp) // foo changed
  expect(newBarTimestamp).toBe(initialBarTimestamp) // bar unchanged

  const barResponsePromise = page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'bar' && response.status() === 200,
  )

  await page.getByRole('button', { name: 'Reload bar only' }).click()
  await barResponsePromise

  // Check that only bar changed
  const finalFooTimestamp = await page.locator('#foo-timestamp').textContent()
  const finalBarTimestamp = await page.locator('#bar-timestamp').textContent()

  expect(finalFooTimestamp).toBe(newFooTimestamp) // foo unchanged
  expect(finalBarTimestamp).not.toBe(newBarTimestamp) // bar changed
})

test('prefetch works with deferred props without errors', async ({ page }) => {
  consoleMessages.listen(page)
  const prefetch = page.waitForResponse('/deferred-props/page-3')

  await page.goto('/deferred-props/page-1')
  await expect(page.getByRole('link', { name: 'Page 3' })).toBeVisible()

  consoleMessages.errors = []

  await page.getByRole('link', { name: 'Page 3' }).hover()
  await prefetch

  const deferred = page.waitForResponse(
    (response) =>
      response.url().includes('/deferred-props/page-3') && 'x-inertia-partial-data' in response.request().headers(),
  )

  await page.getByRole('link', { name: 'Page 3' }).click()
  await page.waitForURL('/deferred-props/page-3')

  await deferred

  await expect(page.getByText('alpha value')).toBeVisible()
  await expect(page.getByText('beta value')).toBeVisible()

  expect(consoleMessages.errors).toHaveLength(0)
})

test('router.reload() without only/except triggers deferred props to reload', async ({ page }) => {
  await page.goto('/deferred-props/with-reload')

  await expect(page.getByText('Loading results...')).toBeVisible()

  await page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'results' && response.status() === 200,
  )

  await expect(page.getByText('Loading results...')).not.toBeVisible()
  await expect(page.locator('#results-data')).toHaveText('Item 1-1, Item 1-2, Item 1-3')
  await expect(page.locator('#results-page')).toHaveText('Page: 1')

  const deferredResponsePromise = page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'results' && response.status() === 200,
  )

  await page.getByRole('button', { name: 'Reload with page 2' }).click()

  await expect(page.getByText('Loading results...')).toBeVisible()

  await deferredResponsePromise

  await expect(page.getByText('Loading results...')).not.toBeVisible()
  await expect(page.locator('#results-data')).toHaveText('Item 2-1, Item 2-2, Item 2-3')
  await expect(page.locator('#results-page')).toHaveText('Page: 2')
})

test('deferred props do not clear validation errors', async ({ page }) => {
  await page.goto('/deferred-props/with-errors')

  await expect(page.locator('#page-error')).not.toBeVisible()
  await expect(page.locator('#form-error')).not.toBeVisible()
  await expect(page.getByText('Loading foo...')).toBeVisible()

  await page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'foo' && response.status() === 200,
  )

  await expect(page.getByText('foo value')).toBeVisible()

  const deferredResponsePromise = page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'foo' && response.status() === 200,
  )
  const errorResponsePromise = page.waitForResponse(
    (response) => !response.request().headers()['x-inertia-partial-data'] && response.status() === 200,
  )

  await page.getByRole('button', { name: 'Submit' }).click()
  await errorResponsePromise

  await expect(page.locator('#page-error')).toBeVisible()
  await expect(page.locator('#page-error')).toHaveText('The name field is required.')
  await expect(page.locator('#form-error')).toBeVisible()
  await expect(page.locator('#form-error')).toHaveText('The name field is required.')
  await expect(page.getByText('Loading foo...')).toBeVisible()

  await deferredResponsePromise

  await expect(page.locator('#page-error')).toBeVisible()
  await expect(page.locator('#page-error')).toHaveText('The name field is required.')
  await expect(page.locator('#form-error')).toBeVisible()
  await expect(page.locator('#form-error')).toHaveText('The name field is required.')
  await expect(page.getByText('foo value')).toBeVisible()
})

test('it refetches pending deferred props after navigating back', async ({ page }) => {
  await page.goto('/deferred-props/back-button/a')

  await expect(page.getByText('Loading fast prop...')).toBeVisible()
  await expect(page.getByText('Loading slow prop...')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page B' }).click()
  await page.waitForURL('/deferred-props/back-button/b')

  await expect(page.getByText('Loading data...')).toBeVisible()

  await page.goBack()
  await page.waitForURL('/deferred-props/back-button/a')

  await expect(page.getByText('Loading fast prop...')).toBeVisible()
  await expect(page.getByText('Loading slow prop...')).toBeVisible()

  await expect(page.getByText('Fast prop loaded')).toBeVisible()
  await expect(page.getByText('Slow prop loaded')).toBeVisible()
})

test('it only refetches deferred props that were not loaded before navigating away', async ({ page }) => {
  await page.goto('/deferred-props/back-button/a')

  await expect(page.getByText('Loading fast prop...')).toBeVisible()
  await expect(page.getByText('Loading slow prop...')).toBeVisible()

  await expect(page.getByText('Fast prop loaded')).toBeVisible()
  await expect(page.getByText('Loading slow prop...')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page B' }).click()
  await page.waitForURL('/deferred-props/back-button/b')

  await page.goBack()
  await page.waitForURL('/deferred-props/back-button/a')

  await expect(page.getByText('Fast prop loaded')).toBeVisible()
  await expect(page.getByText('Loading slow prop...')).toBeVisible()

  await expect(page.getByText('Slow prop loaded')).toBeVisible()
})
