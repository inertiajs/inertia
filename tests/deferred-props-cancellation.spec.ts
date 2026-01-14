import { expect, test } from '@playwright/test'

test.describe('Deferred Props Cancellation', () => {
  test('it cancels in-flight deferred props when navigating to a different URL', async ({ page }) => {
    const cancelledFromA: string[] = []
    const completedFromA: string[] = []
    const completedFromB: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/a') && req.headers()['x-inertia-partial-data']) {
        cancelledFromA.push(req.headers()['x-inertia-partial-data'])
      }
    })

    page.on('response', (res) => {
      const prop = res.request().headers()['x-inertia-partial-data']
      if (prop && res.status() === 200) {
        if (res.url().includes('/a')) {
          completedFromA.push(prop)
        } else if (res.url().includes('/b')) {
          completedFromB.push(prop)
        }
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Page: a')).toBeVisible()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Navigate away before deferred props complete
    await page.getByRole('link', { name: 'Page B' }).click()
    await expect(page.getByText('Page: b')).toBeVisible()

    // Wait for B's deferred props
    await expect(page.getByText('users data for b')).toBeVisible()

    // A's requests were cancelled, B's completed
    expect(cancelledFromA).toHaveLength(3)
    expect(completedFromA).toHaveLength(0)
    expect(completedFromB).toHaveLength(3)
  })

  test('it does not cancel deferred props for same-URL operations', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('rapid-navigation') && req.headers()['x-inertia-partial-data']) {
        cancelled.push(req.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Trigger a reload (same URL)
    await page.getByRole('button', { name: 'Plain reload' }).click()

    // Wait for deferred props to complete
    await expect(page.getByText('users data for a')).toBeVisible()

    expect(cancelled).toHaveLength(0)
  })

  test('it preserves prefetch requests when navigating', async ({ page }) => {
    const cancelledPrefetch: string[] = []
    const completedPrefetch: string[] = []
    const cancelledDeferred: string[] = []

    page.on('requestfailed', (req) => {
      if (req.headers().purpose === 'prefetch') {
        cancelledPrefetch.push(req.url())
      } else if (req.headers()['x-inertia-partial-data']) {
        cancelledDeferred.push(req.headers()['x-inertia-partial-data'])
      }
    })

    page.on('response', (res) => {
      if (res.request().headers().purpose === 'prefetch' && res.status() === 200) {
        completedPrefetch.push(res.url())
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Start a prefetch
    const prefetchPromise = page.waitForResponse(
      (res) => res.url().includes('page-1') && res.request().headers().purpose === 'prefetch',
    )
    await page.getByRole('button', { name: 'Prefetch Page 1' }).click()

    // Navigate away (should cancel deferred but not prefetch)
    await page.getByRole('link', { name: 'Page B' }).click()
    await expect(page.getByText('Page: b')).toBeVisible()

    await prefetchPromise

    // Deferred props cancelled, prefetch preserved
    expect(cancelledDeferred.length).toBeGreaterThan(0)
    expect(cancelledPrefetch).toHaveLength(0)
    expect(completedPrefetch.some((url) => url.includes('page-1'))).toBe(true)
  })

  test('it does not cancel deferred props when onBefore prevents navigation', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('rapid-navigation') && req.headers()['x-inertia-partial-data']) {
        cancelled.push(req.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Set up dialog to cancel navigation
    page.on('dialog', (dialog) => dialog.dismiss())

    await page.getByRole('button', { name: 'Navigate with onBefore' }).click()

    // Should still be on A, deferred props should complete
    await expect(page.getByText('users data for a')).toBeVisible()
    expect(cancelled).toHaveLength(0)
  })

  test('it cancels deferred props on back navigation', async ({ page }) => {
    const cancelledFromB: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/b') && req.headers()['x-inertia-partial-data']) {
        cancelledFromB.push(req.headers()['x-inertia-partial-data'])
      }
    })

    // Load A completely first
    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('users data for a')).toBeVisible()

    // Navigate to B
    await page.getByRole('link', { name: 'Page B' }).click()
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Go back before B's deferred complete
    await page.goBack()
    await expect(page.getByText('Page: a')).toBeVisible()

    // B's deferred props were cancelled
    expect(cancelledFromB).toHaveLength(3)
  })

  test('it cancels deferred props when query parameter changes', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('rapid-navigation') && req.headers()['x-inertia-partial-data']) {
        cancelled.push(req.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Navigate to same path but with query param (different URL)
    await page.getByRole('button', { name: 'Add query param' }).click()

    // Wait for new deferred props to complete
    await expect(page.getByText('users data for a')).toBeVisible()

    // Original requests were cancelled (URL changed due to query param)
    expect(cancelled).toHaveLength(3)
  })

  test('it does not cancel deferred props when only hash changes', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('rapid-navigation') && req.headers()['x-inertia-partial-data']) {
        cancelled.push(req.headers()['x-inertia-partial-data'])
      }
    })

    await page.goto('/deferred-props/rapid-navigation/a')
    await expect(page.getByText('Loading users...')).toBeVisible()

    // Change only the hash (same URL per isSameUrlWithoutHash)
    await page.evaluate(() => {
      window.location.hash = '#section'
    })

    // Wait for deferred props to complete
    await expect(page.getByText('users data for a')).toBeVisible()

    // No requests were cancelled (hash-only change)
    expect(cancelled).toHaveLength(0)
  })
})
