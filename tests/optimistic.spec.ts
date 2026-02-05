import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.beforeEach(async ({ page }) => {
  // Reset server-side todo list before each test
  await page.goto('/optimistic')
  await page.locator('#clear-btn').click()
  await expect(page.locator('#todo-list li')).toHaveCount(2)
})

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

test('it rolls back optimistic update on error and preserves validation errors', async ({ page }) => {
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

  // Validation errors from page props should be preserved (not wiped by snapshot restore)
  await expect(page.locator('.error')).toContainText('The name field is required.')
})

test('it only snapshots props that actually changed (preserves other server response props)', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/optimistic')

  await expect(page.locator('#todo-list li')).toHaveCount(2)
  await expect(page.locator('#server-timestamp')).not.toBeVisible()

  // Submit invalid - server will respond with errors AND serverTimestamp
  await page.locator('#add-btn').click()

  // Optimistic update adds a todo (only touches 'todos' prop)
  await expect(page.locator('#todo-list li')).toHaveCount(3)

  // Wait for error response
  await expect(page.locator('#error-count')).toContainText('Error: 1', { timeout: 10000 })

  // After rollback:
  // - 'todos' should be rolled back (only 2 items)
  // - 'errors' should be preserved from server (not in optimistic callback)
  // - 'serverTimestamp' should be preserved from server (not in optimistic callback)
  await expect(page.locator('#todo-list li')).toHaveCount(2)
  await expect(page.locator('.error')).toContainText('The name field is required.')
  await expect(page.locator('#server-timestamp')).toBeVisible()
  await expect(page.locator('#server-timestamp')).toContainText('Server timestamp:')
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
