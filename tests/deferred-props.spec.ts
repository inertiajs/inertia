import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

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

  await page.waitForResponse(page.url())

  await expect(page.getByText('Loading foo...')).not.toBeVisible()
  await expect(page.getByText('Loading bar...')).not.toBeVisible()
  await expect(page.getByText('foo value')).toBeVisible()
  await expect(page.getByText('bar value')).toBeVisible()

  await page.reload()

  await expect(page.getByText('Loading foo...')).toBeVisible()
  await expect(page.getByText('Loading bar...')).toBeVisible()

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
