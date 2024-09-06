import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test.beforeEach(async ({ page }) => {
  pageLoads.watch(page)
  await page.goto('/error-modal')
})

test('displays the modal containing the response as HTML when an invalid Inertia response comes back', async ({
  page,
}) => {
  await page.getByText('Invalid Visit', { exact: true }).click()
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
  await expect(page.frameLocator('iframe').locator('body')).toContainText(
    'This is a page that does not have the Inertia app loaded.',
  )
})

test('displays the modal with a helpful message when a regular JSON response comes back instead of an Inertia response', async ({
  page,
}) => {
  await page.getByText('Invalid Visit (JSON response)').click()
  await expect(page.frameLocator('iframe').locator('body')).toContainText(
    'All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.',
  )
  await page.frameLocator('iframe').getByText('All Inertia requests must').click()
  await expect(page.frameLocator('iframe').locator('body')).toContainText('{"foo":"bar"}')
})

test('can close the modal using the escape key', async ({ page }) => {
  await page.getByText('Invalid Visit', { exact: true }).click()
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
  await page.locator('body').press('Escape')
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()
})
