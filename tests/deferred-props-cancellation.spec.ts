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
    expect(cancelledRequests).toHaveLength(9)

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

  test('partial reload with except on same page does NOT cancel deferred props', async ({ page }) => {
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

    // Immediately do a partial reload with except (same URL - should NOT cancel in-flight deferred props)
    await page.getByRole('button', { name: 'Reload with except' }).click()

    // Wait for all 3 of the original deferred props to complete (not cancelled by reload)
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

    // Verify data is visible
    await expect(page.getByText('users data for a')).toBeVisible()
    await expect(page.getByText('stats data for a')).toBeVisible()
    await expect(page.getByText('activity data for a')).toBeVisible()

    // No deferred requests were cancelled (same URL)
    expect(cancelledRequests).toHaveLength(0)
  })

  test('navigate to different URL with only parameter DOES cancel deferred props', async ({ page }) => {
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

    // Navigate to a DIFFERENT URL with only parameter
    // Note: only causes partial merge, so filter prop won't update (same component)
    // But cancellation should still happen because URL changed
    await page.getByRole('button', { name: 'Visit B with only', exact: true }).click()

    // Wait for the partial update to complete (users prop from B)
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/b') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )

    // Note: filter still shows 'a' because only: ['users'] means filter prop isn't merged
    // But users data should be from B
    await expect(page.getByText('users data for b')).toBeVisible()

    // Filter A's deferred requests (stats, activity) were cancelled (URL changed)
    // Note: users from A was also cancelled, then users from B was requested
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })

  test('back navigation cancels in-flight deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A and wait for it to complete
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await expect(page.getByText('users data for a')).toBeVisible()

    // Navigate to filter B
    await page.getByRole('link', { name: 'Filter B' }).click()
    await expect(page.getByText('Current filter: b')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Immediately go back while B's deferred props are in flight
    await page.goBack()

    // Wait for back navigation to A
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Filter B's deferred requests were cancelled
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })

  test('query parameter change cancels in-flight deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Change query parameter (same path, different query string = different URL)
    await page.goto('/deferred-props/rapid-navigation/a?newparam=value')

    // Wait for new page load
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Original deferred requests were cancelled (URL changed due to query param)
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })

  test('hash-only change does NOT cancel in-flight deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Change hash only (same URL per isSameUrlWithoutHash)
    await page.evaluate(() => {
      window.location.hash = '#section2'
    })

    // Wait a moment for any potential cancellations
    await page.waitForTimeout(500)

    // Wait for all deferred props to complete (not cancelled)
    await page.waitForResponse(
      (response) =>
        response.url().includes('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().includes('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'stats' &&
        response.status() === 200,
    )
    await page.waitForResponse(
      (response) =>
        response.url().includes('/a') &&
        response.request().headers()['x-inertia-partial-data'] === 'activity' &&
        response.status() === 200,
    )

    // Verify data is visible
    await expect(page.getByText('users data for a')).toBeVisible()
    await expect(page.getByText('stats data for a')).toBeVisible()
    await expect(page.getByText('activity data for a')).toBeVisible()

    // No requests were cancelled (hash-only change)
    expect(cancelledRequests).toHaveLength(0)
  })

  test('re-visiting same URL does NOT cancel in-flight deferred props', async ({ page }) => {
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

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Re-visit the exact same URL we're already on
    await page.getByRole('button', { name: 'Re-visit same URL' }).click()

    // Wait for page to settle
    await page.waitForTimeout(500)

    // All original deferred props should complete (not cancelled - same URL)
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

    // Verify data is visible
    await expect(page.getByText('users data for a')).toBeVisible()
    await expect(page.getByText('stats data for a')).toBeVisible()
    await expect(page.getByText('activity data for a')).toBeVisible()

    // No cancellations (same URL)
    expect(cancelledRequests).toHaveLength(0)
  })

  test('plain reload() does NOT cancel in-flight deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Call plain reload() with no options
    await page.getByRole('button', { name: 'Plain reload' }).click()

    // Wait for reload to process
    await page.waitForTimeout(500)

    // All deferred props should complete (same URL, no cancellation)
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

    // Verify data is visible
    await expect(page.getByText('users data for a')).toBeVisible()
    await expect(page.getByText('stats data for a')).toBeVisible()
    await expect(page.getByText('activity data for a')).toBeVisible()

    // No cancellations (same URL reload)
    expect(cancelledRequests).toHaveLength(0)
  })

  test('reload with both only and except does NOT cancel in-flight deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Reload with both only and except (same URL)
    await page.getByRole('button', { name: 'Reload with only and except' }).click()

    // Wait for reload to process
    await page.waitForTimeout(500)

    // Original deferred props should complete (same URL, no cancellation)
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

    // No cancellations (same URL)
    expect(cancelledRequests).toHaveLength(0)
  })

  test('navigate to different URL with except parameter DOES cancel deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Navigate to different URL with except parameter (URL changed)
    await page.getByRole('button', { name: 'Visit B with except' }).click()

    // Wait for filter B to load
    await expect(page.getByText('Current filter: b')).toBeVisible()

    // Filter A's deferred requests were cancelled (URL changed, except doesn't prevent cancellation)
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })

  test('navigate to different URL with both only and except DOES cancel deferred props', async ({ page }) => {
    const cancelledRequests: string[] = []

    page.on('requestfailed', (request) => {
      if (request.url().includes('rapid-navigation') && request.headers()['x-inertia-partial-data']) {
        cancelledRequests.push(request.headers()['x-inertia-partial-data'])
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Navigate to different URL with both only and except
    // Note: only+except causes partial merge, filter won't update (same component)
    // But cancellation should still happen because URL changed
    await page.getByRole('button', { name: 'Visit B with only and except', exact: true }).click()

    // Wait for the partial update to complete (users prop from B, stats excluded)
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/b') &&
        response.request().headers()['x-inertia-partial-data'] === 'users' &&
        response.status() === 200,
    )

    // Verify users data from B loaded (even though filter still shows 'a')
    await expect(page.getByText('users data for b')).toBeVisible()

    // Filter A's deferred requests were cancelled (URL changed)
    expect(cancelledRequests).toContain('users')
    expect(cancelledRequests).toContain('stats')
    expect(cancelledRequests).toContain('activity')
    expect(cancelledRequests).toHaveLength(3)
  })

  test('prefetch continues when navigating to different URL (not cancelled)', async ({ page }) => {
    const cancelledPrefetches: string[] = []
    const completedPrefetches: string[] = []

    page.on('requestfailed', (request) => {
      const headers = request.headers()
      if (headers.purpose === 'prefetch') {
        const url = new URL(request.url())
        cancelledPrefetches.push(url.pathname)
      }
    })

    page.on('response', (response) => {
      const headers = response.request().headers()
      if (headers.purpose === 'prefetch' && response.status() === 200) {
        const url = new URL(response.url())
        completedPrefetches.push(url.pathname)
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Set up response listener BEFORE clicking prefetch
    const prefetchPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/deferred-props/rapid-navigation/b') &&
        response.request().headers().purpose === 'prefetch' &&
        response.status() === 200,
    )

    // Start prefetch for Filter B
    await page.getByRole('button', { name: 'Prefetch Filter B' }).click()

    // Immediately navigate to a different page (not B)
    await page.getByRole('link', { name: 'Navigate Away' }).click()
    await expect(page.getByText('Loading foo...')).toBeVisible()

    // Wait for prefetch to complete (it should NOT be cancelled)
    await prefetchPromise

    // Prefetch for Filter B should have completed (not cancelled)
    expect(completedPrefetches).toContain('/deferred-props/rapid-navigation/b')
    expect(cancelledPrefetches).not.toContain('/deferred-props/rapid-navigation/b')
  })

  test('deferred props cancelled but prefetch preserved on navigation', async ({ page }) => {
    const cancelledDeferreds: string[] = []
    const cancelledPrefetches: string[] = []
    const completedPrefetches: string[] = []

    page.on('requestfailed', (request) => {
      const headers = request.headers()
      if (headers.purpose === 'prefetch') {
        const url = new URL(request.url())
        cancelledPrefetches.push(url.pathname)
      } else if (headers['x-inertia-partial-data']) {
        cancelledDeferreds.push(headers['x-inertia-partial-data'])
      }
    })

    page.on('response', (response) => {
      const headers = response.request().headers()
      if (headers.purpose === 'prefetch' && response.status() === 200) {
        const url = new URL(response.url())
        completedPrefetches.push(url.pathname)
      }
    })

    // Navigate to filter A (with deferred props loading)
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Set up response listener BEFORE clicking prefetch
    const prefetchPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/deferred-props/page-1') &&
        response.request().headers().purpose === 'prefetch' &&
        response.status() === 200,
    )

    // Start prefetch for Page 1
    await page.getByRole('button', { name: 'Prefetch Page 1' }).click()

    // Navigate to Filter B (should cancel A's deferred props but NOT the prefetch)
    await page.getByRole('link', { name: 'Filter B' }).click()
    await expect(page.getByText('Current filter: b')).toBeVisible()

    // Wait for prefetch to complete
    await prefetchPromise

    // Deferred props from A should be cancelled
    expect(cancelledDeferreds).toContain('users')
    expect(cancelledDeferreds).toContain('stats')
    expect(cancelledDeferreds).toContain('activity')

    // But prefetch should complete (not cancelled)
    expect(completedPrefetches).toContain('/deferred-props/page-1')
    expect(cancelledPrefetches).not.toContain('/deferred-props/page-1')
  })

  test('multiple prefetches continue after navigation', async ({ page }) => {
    const cancelledPrefetches: string[] = []
    const completedPrefetches: string[] = []

    page.on('requestfailed', (request) => {
      const headers = request.headers()
      if (headers.purpose === 'prefetch') {
        const url = new URL(request.url())
        cancelledPrefetches.push(url.pathname)
      }
    })

    page.on('response', (response) => {
      const headers = response.request().headers()
      if (headers.purpose === 'prefetch' && response.status() === 200) {
        const url = new URL(response.url())
        completedPrefetches.push(url.pathname)
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Set up response listeners BEFORE clicking prefetch
    const prefetchBPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/deferred-props/rapid-navigation/b') &&
        response.request().headers().purpose === 'prefetch' &&
        response.status() === 200,
    )
    const prefetchPage1Promise = page.waitForResponse(
      (response) =>
        response.url().includes('/deferred-props/page-1') &&
        response.request().headers().purpose === 'prefetch' &&
        response.status() === 200,
    )

    // Start multiple prefetches
    await page.getByRole('button', { name: 'Prefetch Filter B' }).click()
    await page.getByRole('button', { name: 'Prefetch Page 1' }).click()

    // Navigate to Filter C
    await page.getByRole('link', { name: 'Filter C' }).click()
    await expect(page.getByText('Current filter: c')).toBeVisible()

    // Wait for both prefetches to complete
    await prefetchBPromise
    await prefetchPage1Promise

    // Both prefetches should complete (not cancelled)
    expect(completedPrefetches).toContain('/deferred-props/rapid-navigation/b')
    expect(completedPrefetches).toContain('/deferred-props/page-1')
    expect(cancelledPrefetches).toHaveLength(0)
  })

  test('prefetch not cancelled by same-URL reload', async ({ page }) => {
    const cancelledPrefetches: string[] = []
    const completedPrefetches: string[] = []

    page.on('requestfailed', (request) => {
      const headers = request.headers()
      if (headers.purpose === 'prefetch') {
        const url = new URL(request.url())
        cancelledPrefetches.push(url.pathname)
      }
    })

    page.on('response', (response) => {
      const headers = response.request().headers()
      if (headers.purpose === 'prefetch' && response.status() === 200) {
        const url = new URL(response.url())
        completedPrefetches.push(url.pathname)
      }
    })

    // Navigate to filter A
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Current filter: a')).toBeVisible()

    // Set up response listener BEFORE clicking prefetch
    const prefetchPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/deferred-props/page-1') &&
        response.request().headers().purpose === 'prefetch' &&
        response.status() === 200,
    )

    // Start prefetch
    await page.getByRole('button', { name: 'Prefetch Page 1' }).click()

    // Do a reload (same URL - shouldn't cancel anything)
    await page.getByRole('button', { name: 'Plain reload' }).click()

    // Wait for prefetch to complete
    await prefetchPromise

    // Prefetch should complete (not cancelled by same-URL operation)
    expect(completedPrefetches).toContain('/deferred-props/page-1')
    expect(cancelledPrefetches).toHaveLength(0)
  })
})
