import { expect, test } from '@playwright/test'

test.describe('useOptimistic', () => {
  test('it applies optimistic updates immediately using callback form', async ({ page }) => {
    await page.goto('/use-optimistic')

    await expect(page.locator('#feature-status')).toContainText('Feature: Disabled')

    await page.click('#toggle-feature')

    // Should update immediately (optimistically)
    await expect(page.locator('#feature-status')).toContainText('Feature: Enabled')
    await expect(page.locator('#feature-processing')).toBeVisible()

    // Wait for request to complete
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/feature'))

    await expect(page.locator('#feature-processing')).not.toBeVisible()
    await expect(page.locator('#feature-status')).toContainText('Feature: Enabled')
    await expect(page.locator('#success-count')).toContainText('Success: 1')
  })

  test('it applies optimistic updates using merge form', async ({ page }) => {
    await page.goto('/use-optimistic')

    await expect(page.locator('#review-rating')).toContainText('Rating: 3')

    await page.click('#rate-5')

    // Should update immediately (optimistically)
    await expect(page.locator('#review-rating')).toContainText('Rating: 5')
    await expect(page.locator('#review-processing')).toBeVisible()

    // Wait for request to complete
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/review'))

    await expect(page.locator('#review-processing')).not.toBeVisible()
    await expect(page.locator('#review-rating')).toContainText('Rating: 5')
  })

  test('it handles computed updates with callback form', async ({ page }) => {
    await page.goto('/use-optimistic')

    await expect(page.locator('#counter-value')).toContainText('Count: 0')

    await page.click('#increment')

    // Should update immediately (optimistically)
    await expect(page.locator('#counter-value')).toContainText('Count: 1')

    // Wait for request to complete
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/counter'))

    // Click again
    await page.click('#increment')
    await expect(page.locator('#counter-value')).toContainText('Count: 2')

    await page.waitForResponse((response) => response.url().includes('/api/optimistic/counter'))

    await expect(page.locator('#counter-value')).toContainText('Count: 2')
    await expect(page.locator('#success-count')).toContainText('Success: 2')
  })

  test('it reverts optimistic update on server error', async ({ page }) => {
    await page.goto('/use-optimistic')

    await expect(page.locator('#error-value')).toContainText('Value: initial')

    await page.click('#trigger-error')

    // Should update immediately (optimistically)
    await expect(page.locator('#error-value')).toContainText('Value: optimistic')
    await expect(page.locator('#error-processing')).toBeVisible()

    // Wait for the error response
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/error'))

    // Should revert to initial value after error
    await expect(page.locator('#error-value')).toContainText('Value: initial')
    await expect(page.locator('#error-processing')).not.toBeVisible()
    await expect(page.locator('#error-count')).toContainText('Error: 1')
  })

  test('it reverts optimistic update on cancel', async ({ page }) => {
    await page.goto('/use-optimistic')

    await expect(page.locator('#cancel-value')).toContainText('Value: initial')

    await page.click('#trigger-cancel')

    // Should update immediately (optimistically)
    await expect(page.locator('#cancel-value')).toContainText('Value: optimistic')
    await expect(page.locator('#cancel-processing')).toBeVisible()

    // Cancel the request
    await page.click('#cancel-request')

    // Should revert to initial value after cancel
    await expect(page.locator('#cancel-value')).toContainText('Value: initial')
    await expect(page.locator('#cancel-processing')).not.toBeVisible()
    await expect(page.locator('#cancel-count')).toContainText('Cancel: 1')
  })

  test('it resets to initial value', async ({ page }) => {
    await page.goto('/use-optimistic')

    // Make some changes
    await page.click('#toggle-feature')
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/feature'))
    await expect(page.locator('#feature-status')).toContainText('Feature: Enabled')

    await page.click('#rate-5')
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/review'))
    await expect(page.locator('#review-rating')).toContainText('Rating: 5')

    await page.click('#increment')
    await page.waitForResponse((response) => response.url().includes('/api/optimistic/counter'))
    await expect(page.locator('#counter-value')).toContainText('Count: 1')

    // Reset all
    await page.click('#reset-all')

    // Should be back to initial values
    await expect(page.locator('#feature-status')).toContainText('Feature: Disabled')
    await expect(page.locator('#review-rating')).toContainText('Rating: 3')
    await expect(page.locator('#counter-value')).toContainText('Count: 0')
    await expect(page.locator('#success-count')).toContainText('Success: 0')
  })
})
