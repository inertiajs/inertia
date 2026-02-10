import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Optimistic', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }, testInfo) => {
    await page
      .context()
      .addCookies([
        { name: 'optimistic-session', value: `worker-${testInfo.workerIndex}`, domain: 'localhost', path: '/' },
      ])

    await page.goto('/optimistic')
    await page.locator('#clear-btn').click()
    await expect(page.locator('#todo-list li')).toHaveCount(2)
  })

  test('it applies optimistic update immediately before request completes', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#new-todo').fill('New optimistic todo')
    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)
    await expect(page.locator('#todo-list')).toContainText('New optimistic todo')

    await expect(page.locator('#success-count')).toContainText('Success: 1')
    await expect(page.locator('#todo-list li')).toHaveCount(3)
  })

  test('it rolls back optimistic update on error and preserves validation errors', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)

    await expect(page.locator('#error-count')).toContainText('Error: 1')
    await expect(page.locator('#todo-list li')).toHaveCount(2)

    await expect(page.locator('.error')).toContainText('The name field is required.')
  })

  test('it only snapshots props that actually changed (preserves other server response props)', async ({ page }) => {
    pageLoads.watch(page)

    await expect(page.locator('#server-timestamp')).not.toBeVisible()

    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)

    await expect(page.locator('#error-count')).toContainText('Error: 1')

    // 'todos' rolled back, but 'errors' and 'serverTimestamp' preserved from server
    await expect(page.locator('#todo-list li')).toHaveCount(2)
    await expect(page.locator('.error')).toContainText('The name field is required.')
    await expect(page.locator('#server-timestamp')).toBeVisible()
    await expect(page.locator('#server-timestamp')).toContainText('Server timestamp:')
  })

  test('it rolls back optimistic update on server error (500)', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#server-error-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)
    await expect(page.locator('#todo-list')).toContainText('Will fail...')

    // Error modal contains an iframe
    await expect(page.locator('iframe')).toBeVisible()

    // Rolled back via onFinish (onSuccess never called for 500 errors)
    await expect(page.locator('#todo-list li')).toHaveCount(2)
    await expect(page.locator('#todo-list')).not.toContainText('Will fail...')
  })

  test('it rolls back first optimistic update when second visit cancels it', async ({ page }) => {
    pageLoads.watch(page)

    // Second click cancels first, restoring its state before applying own optimistic update
    await page.locator('#add-btn').click()
    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)

    // Only the second request completes (first was cancelled)
    await expect(page.locator('#error-count')).toContainText('Error: 1')
    await expect(page.locator('#todo-list li')).toHaveCount(2)
  })
})
