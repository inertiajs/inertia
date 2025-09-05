import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

test('can merge props', async ({ page }) => {
  await page.goto('/merge-props')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 5')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 10')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 15')).toBeVisible()

  await clickAndWaitForResponse(page, 'Get Fresh', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 5')).toBeVisible()

  await clickAndWaitForResponse(page, 'Reload', null, 'button')

  await expect(page.getByText('bar count is 5')).toBeVisible()
  await expect(page.getByText('foo count is 10')).toBeVisible()
})

test('can append to nested props', async ({ page }) => {
  await page.goto('/merge-nested-props/append')

  await expect(page.getByText('User 1, User 2, User 3')).toBeVisible()
  await expect(page.getByText('Page: 1, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', page.url() + '?page=2', 'button')

  await expect(page.getByText('User 1, User 2, User 3, User 4, User 5, User 6')).toBeVisible()
  await expect(page.getByText('Page: 2, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', page.url() + '?page=3', 'button')

  await expect(page.getByText('User 1, User 2, User 3, User 4, User 5, User 6, User 7, User 8, User 9')).toBeVisible()
  await expect(page.getByText('Page: 3, Per Page: 3')).toBeVisible()
})

test('can prepend to nested props', async ({ page }) => {
  await page.goto('/merge-nested-props/prepend')

  await expect(page.getByText('User 3, User 2, User 1')).toBeVisible()
  await expect(page.getByText('Page: 1, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', page.url() + '?page=2', 'button')

  await expect(page.getByText('User 6, User 5, User 4, User 3, User 2, User 1')).toBeVisible()
  await expect(page.getByText('Page: 2, Per Page: 3')).toBeVisible()

  await clickAndWaitForResponse(page, 'Load More', page.url() + '?page=3', 'button')

  await expect(page.getByText('User 9, User 8, User 7, User 6, User 5, User 4, User 3, User 2, User 1')).toBeVisible()
  await expect(page.getByText('Page: 3, Per Page: 3')).toBeVisible()
})
