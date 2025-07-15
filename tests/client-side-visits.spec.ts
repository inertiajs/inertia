import test, { expect } from '@playwright/test'
import { pageLoads, requests } from './support'

test('replaces the page client side', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('foo from server')).toBeVisible()
  await expect(page.getByText('bar from server')).toBeVisible()
  await expect(page.getByText('foo from client')).not.toBeVisible()
  await expect(page.getByText('Finished: 0')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await page.getByRole('button', { name: 'Replace' }).click()

  await expect(page).toHaveURL('/client-side-visit')
  await expect(page.getByText('foo from server')).not.toBeVisible()
  await expect(page.getByText('foo from client')).toBeVisible()
  await expect(page.getByText('bar from server')).toBeVisible()
  await expect(page.getByText('Finished: 1')).toBeVisible()
  await expect(page.getByText('Success: 1')).toBeVisible()

  await expect(requests.requests.length).toBe(0)

  const historyLength = await page.evaluate(() => window.history.length)

  await expect(historyLength).toBe(2)
})

test('fires an onError callback when the props has errors', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('Errors: 0')).toBeVisible()
  await expect(page.getByText('Finished: 0')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await page.getByRole('button', { name: 'Errors (default)' }).click()

  await expect(page.getByText('Finished: 1')).toBeVisible()
  await expect(page.getByText('Errors: 2')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await expect(requests.requests.length).toBe(0)
})

test('fires an onError callback when the props has errors in a custom bag', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('Errors: 0')).toBeVisible()
  await expect(page.getByText('Finished: 0')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await page.getByRole('button', { name: 'Errors (bag)' }).click()

  await expect(page.getByText('Finished: 1')).toBeVisible()
  await expect(page.getByText('Errors: 1')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()
  await expect(requests.requests.length).toBe(0)
})

test('pushes the page client side', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('foo from server')).toBeVisible()
  await expect(page.getByText('bar from server')).toBeVisible()
  await expect(page.getByText('baz from client')).not.toBeVisible()

  await page.getByRole('button', { name: 'Push' }).click()

  await expect(page).toHaveURL('/client-side-visit-2')
  await expect(page.getByText('foo from server')).not.toBeVisible()
  await expect(page.getByText('bar from server')).not.toBeVisible()
  await expect(page.getByText('baz from client')).toBeVisible()

  await expect(requests.requests.length).toBe(0)

  const historyLength = await page.evaluate(() => window.history.length)

  await expect(historyLength).toBe(3)
})
