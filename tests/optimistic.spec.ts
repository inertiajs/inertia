import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test('it applies optimistic update immediately before request completes', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/optimistic')

  await expect(page.locator('#todo-list li')).toHaveCount(2)

  await page.locator('#new-todo').fill('New optimistic todo')
  await page.locator('#add-btn').click()

  // Optimistic update should be applied immediately
  await expect(page.locator('#todo-list li')).toHaveCount(3)
  await expect(page.locator('#todo-list')).toContainText('New optimistic todo')

  // After success, the server response replaces the optimistic value
  await expect(page.locator('#success-count')).toContainText('Success: 1', { timeout: 10000 })
  await expect(page.locator('#todo-list li')).toHaveCount(3)
})

test('it rolls back optimistic update on error', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/optimistic')

  await expect(page.locator('#todo-list li')).toHaveCount(2)

  // Don't fill in a name - this will cause a validation error
  await page.locator('#add-btn').click()

  // Optimistic update should be applied immediately
  await expect(page.locator('#todo-list li')).toHaveCount(3)

  // After error, the optimistic update should be rolled back
  await expect(page.locator('#error-count')).toContainText('Error: 1', { timeout: 10000 })
  await expect(page.locator('#todo-list li')).toHaveCount(2)
})

test('it rolls back first optimistic update when second visit cancels it', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/optimistic')

  await expect(page.locator('#todo-list li')).toHaveCount(2)

  // Rapidly submit two invalid todos - second visit cancels first
  await page.locator('#add-btn').click()
  await page.locator('#add-btn').click()

  // Second click cancels first (restoring its optimistic state), then applies its own
  // So we should see 3 items (2 original + 1 from second optimistic update)
  await expect(page.locator('#todo-list li')).toHaveCount(3)

  // Only the second request completes (first was cancelled), and it fails
  await expect(page.locator('#error-count')).toContainText('Error: 1', { timeout: 10000 })
  await expect(page.locator('#todo-list li')).toHaveCount(2)
})
