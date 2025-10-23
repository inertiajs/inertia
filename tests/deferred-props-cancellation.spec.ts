import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

test.describe('Deferred Props Cancellation', () => {
  test('initial page load completes all deferred props without cancellation', async ({ page }) => {
    const cancelledRequests: string[] = []
    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation')

    // Wait for all loading states to appear
    await expect(page.getByText('Loading users...')).toBeVisible()
    await expect(page.getByText('Loading stats...')).toBeVisible()
    await expect(page.getByText('Loading activity...')).toBeVisible()

    // Wait for all 3 deferred prop responses (3 separate groups)
    await page.waitForResponse(
      (response) =>
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] === 'stats' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] === 'activity' &&
        response.status() === 200,
    )

    // Verify all data loaded
    await expect(page.getByText('users data for none')).toBeVisible()
    await expect(page.getByText('stats data for none')).toBeVisible()
    await expect(page.getByText('activity data for none')).toBeVisible()

    // Verify no requests were cancelled
    expect(cancelledRequests).toHaveLength(0)
  })

  test('rapid navigation cancels in-flight deferred props', async ({ page }) => {
    // Track which deferred prop requests were cancelled
    const cancelledRequests: string[] = []
    const completedRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    page.on('response', (response) => {
      if (
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] &&
        response.status() === 200
      ) {
        completedRequests.push(response.request().headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')

    // Wait for initial page load to complete
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Wait for loading states to appear (deferred props have started)
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Immediately navigate to filter=b (before filter=a deferred props complete - they take 600ms)
    await page.getByRole('link', { name: 'Filter B' }).click()

    // Wait for filter B's page to load
    await expect(page.getByText('Current filter: b')).toBeVisible()

    // Wait for all 3 of filter B's deferred props to complete
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/b') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/b') &&
        response.request().headers()['x-inertia-partial-data'] === 'stats' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/b') &&
        response.request().headers()['x-inertia-partial-data'] === 'activity' &&
        response.status() === 200,
    )

    // Verify filter B data is visible
    await expect(page.getByText('users data for b')).toBeVisible()
    await expect(page.getByText('stats data for b')).toBeVisible()
    await expect(page.getByText('activity data for b')).toBeVisible()

    // Filter A's 3 deferred requests were CANCELLED (never completed)
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)

    // Verify only filter B's requests completed (not filter A's)
    expect(completedRequests).toEqual(['users', 'stats', 'activity'])
  })

  test('multiple rapid clicks only complete latest request', async ({ page }) => {
    const cancelledRequests: string[] = []
    const completedRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    page.on('response', (response) => {
      if (
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] &&
        response.status() === 200
      ) {
        completedRequests.push(response.request().headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/none')

    // Wait for initial page load
    await expect(page.getByText('Current filter: none')).toBeVisible()

    // Rapid fire clicks (all before any deferred props complete)
    await page.getByRole('link', { name: 'Filter A' }).click()
    await page.getByRole('link', { name: 'Filter B' }).click()
    await page.getByRole('link', { name: 'Filter C' }).click()

    // Wait for filter C to complete
    await expect(page.getByText('Current filter: c')).toBeVisible()

    // Wait for all 3 of filter C's deferred props
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/c') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/c') &&
        response.request().headers()['x-inertia-partial-data'] === 'stats' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/c') &&
        response.request().headers()['x-inertia-partial-data'] === 'activity' &&
        response.status() === 200,
    )

    // Only filter C data should be visible
    await expect(page.getByText('users data for c')).toBeVisible()
    await expect(page.getByText('stats data for c')).toBeVisible()
    await expect(page.getByText('activity data for c')).toBeVisible()

    // All deferred requests from none, A, and B were cancelled
    // 3 from initial (none) + 3 from A + 3 from B = 9 cancelled requests
    expect(cancelledRequests.length).toBeGreaterThanOrEqual(6) // At least A and B were cancelled

    // Only filter C's requests should have completed
    expect(completedRequests).toEqual(['users', 'stats', 'activity'])
  })

  test('navigation to different page cancels all in-flight deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation')

    // Wait for loading states
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Navigate to a completely different page
    await clickAndWaitForResponse(page, 'Navigate Away', '/deferred-props/page-1')

    // We should now be on page-1
    await expect(page.getByText('Loading foo...')).toBeVisible()

    // Wait for page-1 deferred props
    await page.waitForResponse(
      (response) =>
        response.url().includes('page-1') &&
        response.request().headers()['x-inertia-partial-data'] &&
        response.status() === 200,
    )

    // Verify page-1 data loaded
    await expect(page.getByText('foo value')).toBeVisible()

    // All 3 of rapid-navigation's deferred requests were cancelled
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })

  test('deferred prop groups load concurrently without cancelling each other', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation')

    // All loading states should appear simultaneously
    await expect(page.getByText('Loading users...')).toBeVisible()
    await expect(page.getByText('Loading stats...')).toBeVisible()
    await expect(page.getByText('Loading activity...')).toBeVisible()

    // Wait for all 3 deferred prop groups to complete concurrently
    await page.waitForResponse(
      (response) =>
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] === 'stats' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().includes('rapid-navigation') &&
        response.request().headers()['x-inertia-partial-data'] === 'activity' &&
        response.status() === 200,
    )

    // All should complete successfully
    await expect(page.getByText('users data for none')).toBeVisible()
    await expect(page.getByText('stats data for none')).toBeVisible()
    await expect(page.getByText('activity data for none')).toBeVisible()

    // No deferred requests were cancelled
    expect(cancelledRequests).toHaveLength(0)
  })

  test('onBefore preventing navigation does not cancel deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')

    // Wait for page load
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Set up dialog handler to cancel the navigation
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Navigate away?')
      await dialog.dismiss() // Click "Cancel" in the confirm dialog
    })

    // Try to navigate (will be prevented by onBefore)
    await page.getByRole('button', { name: 'Navigate with onBefore' }).click()

    // Wait for all 3 original deferred props to complete (not cancelled)
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'stats' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'activity' &&
        response.status() === 200,
    )

    // We should still be on filter=a
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Original deferred props should complete successfully (not cancelled)
    await expect(page.getByText('users data for a')).toBeVisible()
    await expect(page.getByText('stats data for a')).toBeVisible()
    await expect(page.getByText('activity data for a')).toBeVisible()

    // No requests were cancelled (navigation was prevented)
    expect(cancelledRequests).toHaveLength(0)
  })

  test('onBefore allowing navigation DOES cancel deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')

    // Wait for page load
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Set up dialog handler to allow the navigation
    page.on('dialog', async (dialog) => {
      await dialog.accept() // Click "OK" in the confirm dialog
    })

    // Navigate (will be allowed by onBefore)
    await page.getByRole('button', { name: 'Navigate with onBefore' }).click()

    // Wait for navigation to page-2
    await expect(page.getByText('Loading baz...')).toBeVisible()

    // Wait for page-2 deferred props
    await page.waitForResponse(
      (response) =>
        response.url().includes('page-2') &&
        response.request().headers()['x-inertia-partial-data'] &&
        response.status() === 200,
    )

    // Page-2 data should load
    await expect(page.getByText('baz value')).toBeVisible()

    // All 3 of filter A's deferred requests were cancelled
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })
})
