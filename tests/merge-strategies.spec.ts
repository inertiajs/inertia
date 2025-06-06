import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

test('can merge props with custom strategies', async ({ page }) => {
  await page.goto('/merge-strategies')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('baz count is 5')).toBeVisible()
  await expect(page.getByText('foo.data count is 5')).toBeVisible()
  await expect(page.getByText('foo.page is 0')).toBeVisible()
  await expect(page.getByText('foo.per_page is 5')).toBeVisible()
  await expect(page.getByText('foo.meta.label is first')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', '/merge-strategies?page=0', 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('baz count is 10')).toBeVisible()
  await expect(page.getByText('foo.data count is 10')).toBeVisible()
  await expect(page.getByText('foo.page is 1')).toBeVisible()
  await expect(page.getByText('foo.per_page is 5')).toBeVisible()
  await expect(page.getByText('foo.meta.label is second')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', '/merge-strategies?page=1', 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('baz count is 15')).toBeVisible()
  await expect(page.getByText('foo.data count is 15')).toBeVisible()
  await expect(page.getByText('foo.page is 2')).toBeVisible()
  await expect(page.getByText('foo.per_page is 5')).toBeVisible()
  await expect(page.getByText('foo.meta.label is third')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', '/merge-strategies?page=0', 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('baz count is 15')).toBeVisible()
  await expect(page.getByText('foo.data count is 15')).toBeVisible()
  await expect(page.getByText('foo.page is 1')).toBeVisible()
  await expect(page.getByText('foo.per_page is 5')).toBeVisible()
  await expect(page.getByText('foo.meta.label is third')).toBeVisible()
})
