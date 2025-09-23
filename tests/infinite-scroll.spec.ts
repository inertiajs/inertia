import { expect, Locator, Page, test } from '@playwright/test'
import { requests } from './support'

function infiniteScrollRequests() {
  return requests.requests.filter((req) => {
    return (
      req.url().includes('/infinite-scroll/') &&
      !!req.headers()['x-inertia'] &&
      !!req.headers()['x-inertia-partial-data']
    )
  })
}

async function smoothScrollTo(page: any, targetY: number) {
  await page.evaluate((top: number) => window.scrollTo({ top, behavior: 'smooth' }), targetY)
  await page.waitForTimeout(150)
}

// Helper function to check URL updates
async function expectQueryString(page: any, expectedPage: string) {
  if (expectedPage === '1') {
    // Page 1 removes the page param entirely
    await page.waitForFunction(() => !window.location.search.includes('page='), { timeout: 800 })
    const currentUrl = await page.url()
    expect(currentUrl).not.toContain('page=')
  } else {
    // Other pages should have explicit page param
    await page.waitForFunction((pageNum: string) => window.location.search.includes(`page=${pageNum}`), expectedPage, {
      timeout: 800,
    })
    const currentUrl = await page.url()
    expect(currentUrl).toContain(`page=${expectedPage}`)
  }
}

test.describe('Automatic page loading', () => {
  test('it loads the next page when scrolling to the bottom', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    // Scroll to middle of page to check we're not loading the next page yet
    await page.evaluate((height) => window.scrollTo(0, height / 2), pageHeight)

    await expect(infiniteScrollRequests().length).toBe(0)

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll to the bottom of the page to trigger loading the next page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the bottom of the page to trigger loading the next page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    // Scroll to the bottom of the page - should NOT trigger loading since User 40 is the last one
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2) // Should still be 2, no additional request

    // Check if the data-infinite-scroll attribute is set correctly
    const user1 = page.locator('[data-user-id="1"]')
    const user15 = page.locator('[data-user-id="15"]')
    const user16 = page.locator('[data-user-id="16"]')
    const user30 = page.locator('[data-user-id="30"]')
    const user31 = page.locator('[data-user-id="31"]')
    const user40 = page.locator('[data-user-id="40"]')

    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user40).toHaveAttribute('data-infinite-scroll-page', '3')
  })

  test('it loads the previous page when scrolling to the top', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both?page=3')

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('User 30')).toBeHidden()

    // It automatically loads page 2 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the top - 500px to make sure we don't trigger the previous page yet
    await page.evaluate(() => window.scrollTo(0, 500))

    await expect(infiniteScrollRequests().length).toBe(1) // Should still be 1, no additional request
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to the top to trigger loading the first
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
  })

  test('it loads pages in reverse order when reverse mode is enabled', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/reverse')

    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('User 26')).toBeVisible()
    await expect(page.getByText('User 25')).toBeHidden()

    // It automatically loads page 2 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 25')).toBeVisible()
    await expect(page.getByText('User 11')).toBeVisible()
    await expect(page.getByText('User 10')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the top to trigger loading the last page
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 10')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    // Check if the data-infinite-scroll attribute is set correctly
    const user1 = page.locator('[data-user-id="1"]')
    const user10 = page.locator('[data-user-id="10"]')
    const user11 = page.locator('[data-user-id="11"]')
    const user25 = page.locator('[data-user-id="25"]')
    const user26 = page.locator('[data-user-id="26"]')
    const user40 = page.locator('[data-user-id="40"]')

    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user10).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user11).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user25).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user26).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user40).toHaveAttribute('data-infinite-scroll-page', '1')
  })
})

test.describe('Manual page loading', () => {
  test('it allows manual loading of next and previous pages when manual mode is enabled', async ({ page }) => {
    await page.goto('/infinite-scroll/manual?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    requests.listen(page)
    await page.getByRole('button', { name: 'Load previous items' }).click()
    await expect(page.getByText('Loading previous items...')).toBeVisible()
    await expect(page.getByText('Loading next items...')).toBeHidden()

    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading previous items...')).toBeHidden()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('Loading next items...')).toBeVisible()
    await expect(page.getByText('Loading previous items...')).toBeHidden()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading next items...')).toBeHidden()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it switches to manual mode after reaching the manualAfter threshold', async ({ page }) => {
    await page.goto('/infinite-scroll/manual-after')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    requests.listen(page)

    // Scroll to the bottom of the page to trigger loading the next page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the bottom of the page to trigger loading the next page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(2)

    // Scroll to the bottom of the page - should NOT trigger loading since we're in manual mode now
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2) // Should still be 2, no additional request

    // Load next items manually
    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 46')).toBeVisible()
    await expect(page.getByText('User 60')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(3)
  })
})

test.describe('Toggle configuration', () => {
  test('it toggles between automatic and manual loading when manual prop changes', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/toggles')

    // Initially manual is false, should auto-load pages
    await expect(page.getByText('Manual mode: false')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Total items on page: 15')).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Enable manual mode
    await page.getByLabel('Manual mode: false').check()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    // Scroll to bottom again - should NOT auto-load page 3 in manual mode
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to top, disable manual mode again
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByLabel('Manual mode: true').uncheck()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    // Scroll to bottom - should auto-load page 3 now
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it toggles between different trigger directions when trigger prop changes', async ({ page }) => {
    requests.listen(page)

    // Start on page 2 with trigger='end' (default), change to trigger='start' to auto-load page 1
    await page.goto('/infinite-scroll/toggles?page=2')

    await expect(page.getByText('Trigger: end')).toBeVisible()
    await page.selectOption('select', 'start')
    await expect(page.getByText('Trigger: start')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Verify User 31 is not loaded yet
    await expect(page.getByText('User 31')).toBeHidden()

    // Scroll to bottom - should NOT load page 3 since trigger='start'
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to top, change trigger to 'end' (loads next pages)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.selectOption('select', 'end')
    await expect(page.getByText('Trigger: end')).toBeVisible()

    // Scroll to bottom - should now load page 3 since trigger='end'
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it toggles between preserving and not preserving URL when preserveUrl prop changes', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/toggles')

    await expect(page.getByText('Preserve URL: false')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Total items on page: 15')).toBeVisible()

    // Load page 2 and scroll to make it the most visible page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    await smoothScrollTo(page, pageHeight)
    await expectQueryString(page, '2')
    await expect(infiniteScrollRequests().length).toBeGreaterThanOrEqual(1)

    // Enable preserveUrl mode - URL should no longer update
    await page.getByLabel('Preserve URL: false').check()
    await expect(page.getByText('Preserve URL: true')).toBeVisible()

    // Load page 3 and scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()

    // URL should still show page=2
    await page.waitForTimeout(500)
    expect(page.url()).toContain('page=2')
    await expect(infiniteScrollRequests().length).toBeGreaterThanOrEqual(2)

    // Disable preserveUrl again
    await page.getByLabel('Preserve URL: true').uncheck()
    await expect(page.getByText('Preserve URL: false')).toBeVisible()

    const newPageHeight = await page.evaluate(() => document.body.scrollHeight)
    await smoothScrollTo(page, newPageHeight)
    await expectQueryString(page, '3')
  })

  test('it toggles between normal and reverse order when reverse prop changes', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/toggles?page=2')

    // Make sure both triggers are enabled
    await page.selectOption('select', 'both')
    await expect(page.getByText('Trigger: both')).toBeVisible()

    // Start on page 2, should auto-load page 1 because trigger=both
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    // Scroll to top, nothing should happen yet
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    // Enable reverse mode
    await page.getByLabel('Reverse: false').check()
    await expect(page.getByText('Reverse: true')).toBeVisible()

    // Scroll to top again, should now load page 3 because reverse=true and trigger=both
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)
  })
})

test.describe('Buffer margin configuration', () => {
  test('it loads the next page early when buffer margin is configured', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-end-buffer')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll close to bottom but not all the way - the buffer should trigger loading earlier
    // With buffer=200, it should trigger when the end element is 200px into the viewport
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    const viewportHeight = await page.evaluate(() => window.innerHeight)

    // Scroll to a position that's close to the bottom but leaves more than 200px
    // This should NOT trigger loading yet (without buffer, we'd need to be closer)
    const scrollPosition = pageHeight - viewportHeight - 300 // 300px from bottom
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition)

    // Should not have triggered loading yet
    await expect(infiniteScrollRequests().length).toBe(0)
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Now scroll to a position that's within the buffer zone (less than 200px from bottom)
    // This should trigger loading due to the buffer
    const bufferScrollPosition = pageHeight - viewportHeight - 150 // 150px from bottom
    await page.evaluate((pos) => window.scrollTo(0, pos), bufferScrollPosition)

    // Should trigger loading due to buffer
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)
  })

  test('it loads the previous page early when buffer margin is configured', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-start-buffer?page=3')

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('User 30')).toBeHidden()

    // It automatically loads page 2 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll close to top but not all the way - the buffer should trigger loading earlier
    // With buffer=200, it should trigger when the start element is 200px into the viewport

    // Scroll to a position that's close to the top but leaves more than 200px
    // This should NOT trigger loading yet (without buffer, we'd need to be closer)
    await page.evaluate(() => window.scrollTo(0, 300)) // 300px from top

    // Should not have triggered loading yet
    await expect(infiniteScrollRequests().length).toBe(1) // Still just the initial load
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Now scroll to a position that's within the buffer zone (less than 200px from top)
    // This should trigger loading due to the buffer
    await page.evaluate(() => window.scrollTo(0, 150)) // 150px from top

    // Should trigger loading due to buffer
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)
  })
})

test.describe('Directional trigger constraints', () => {
  test('it only loads previous pages when trigger is set to start', async ({ page }) => {
    requests.listen(page)
    // Start on page 2 to verify page 1 auto-loads due to visible start trigger
    await page.goto('/infinite-scroll/trigger-start-buffer?page=2')

    // Initially page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()

    // Page 1 should auto-load because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Should have made 1 request to load page 1
    await expect(infiniteScrollRequests().length).toBe(1)

    // Now scroll to the bottom - should NOT trigger loading page 3 since trigger=start
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Wait a moment to ensure no loading is triggered
    await page.waitForTimeout(500)

    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    // Should still be 1 request (only the initial auto-load of page 1)
    await expect(infiniteScrollRequests().length).toBe(1)
  })

  test('it only loads next pages when trigger is set to end', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-end-buffer?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()

    // Scroll to the top of the page - should NOT trigger loading since trigger=end
    await page.evaluate(() => window.scrollTo(0, 0))

    // Wait a moment to ensure no loading is triggered
    await page.waitForTimeout(500)

    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(0)
  })

  test('it loads pages in both directions when trigger is set to both', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both?page=2')

    // Initially, page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()

    // It automatically loads page 1 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to bottom to trigger loading page 3
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2)

    // Verify all three pages are now loaded (users 1-40)
    await expect(page.getByText('User 1', { exact: true })).toBeVisible() // Page 1
    await expect(page.getByText('User 15')).toBeVisible() // Page 1
    await expect(page.getByText('User 16')).toBeVisible() // Page 2
    await expect(page.getByText('User 30')).toBeVisible() // Page 2
    await expect(page.getByText('User 31')).toBeVisible() // Page 3
    await expect(page.getByText('User 40')).toBeVisible() // Page 3
  })
})

test.describe('DOM element ordering', () => {
  async function getUserIdsFromDOM(page) {
    const userCards = await page.locator('[data-user-id]').all()
    const userIds = []

    for (const card of userCards) {
      const userId = await card.getAttribute('data-user-id')
      userIds.push(parseInt(userId))
    }

    return userIds
  }

  test('it maintains correct DOM element order when pages load out of sequence', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both?page=2')

    // Initially, page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    // It automatically loads page 1 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom to trigger loading page 3
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Get all user cards and check their order in the DOM
    const userIds = await getUserIdsFromDOM(page)

    // Verify the DOM order: should start with user 1, have user 20 somewhere in middle, end with user 40
    expect(userIds[0]).toBe(1) // First user should be User 1
    expect(userIds.includes(20)).toBe(true) // User 20 should be present (middle of page 2)
    expect(userIds[userIds.length - 1]).toBe(40) // Last user should be User 40

    // Verify all users from pages 1-3 are present (users 1-40) and in ascending order
    expect(userIds).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
  })

  test('it maintains correct DOM element order in reverse pagination mode', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/reverse?page=2')

    // Initially, page 2 should be visible (users 11-25 in reverse mode)
    await expect(page.getByText('User 11')).toBeVisible()
    await expect(page.getByText('User 25')).toBeVisible()

    // It automatically loads page 3 because the start trigger is visible (users 1-10)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 10')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom to trigger loading page 1 (users 26-40)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 26')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Get all user cards and check their order in the DOM
    const userIds = await getUserIdsFromDOM(page)

    // In reverse mode, DOM order should still be 1-40 (logical order maintained)
    expect(userIds[0]).toBe(1) // First user should be User 1
    expect(userIds.includes(20)).toBe(true) // User 20 should be present (middle of page 2)
    expect(userIds[userIds.length - 1]).toBe(40) // Last user should be User 40

    // Verify all users from pages 1-3 are present (users 1-40) and in ascending order
    expect(userIds).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
  })
})

test.describe('Component customization', () => {
  test('it renders as a custom HTML element when using the as prop', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/custom-element')

    // Verify the InfiniteScroll component renders as a section element
    const container = page.locator('section[data-testid="infinite-scroll-container"]')
    await expect(container).toBeVisible()

    // Verify the custom class is applied
    await expect(container).toHaveClass(/custom-infinite-scroll/)

    // Verify it still functions as infinite scroll
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll to trigger loading next page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Verify it's still a section element after loading
    await expect(container).toBeVisible()
    await expect(container).toHaveClass(/custom-infinite-scroll/)
  })
})

test.describe('URL query string management', () => {
  test('it assigns page tracking attributes to dynamically loaded items', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/update-query-string')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll to bottom to load page 2
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom again to load page 3
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Verify data attributes are set correctly for infinite scroll
    const dataAttrs = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[data-user-id]'))
      return elements.map((el) => ({
        userId: parseInt(el.getAttribute('data-user-id') || '0'),
        infiniteScrollPage: el.getAttribute('data-infinite-scroll-page'),
      }))
    })

    // Verify that we have elements from all 3 pages with correct page attributes
    const page1Elements = dataAttrs.filter((el) => el.infiniteScrollPage === '1')
    const page2Elements = dataAttrs.filter((el) => el.infiniteScrollPage === '2')
    const page3Elements = dataAttrs.filter((el) => el.infiniteScrollPage === '3')

    expect(page1Elements.length).toBe(15) // Users 1-15
    expect(page2Elements.length).toBe(15) // Users 16-30
    expect(page3Elements.length).toBe(10) // Users 31-40

    // Verify the page attributes are assigned to the correct user IDs
    expect(page1Elements.every((el) => el.userId >= 1 && el.userId <= 15)).toBe(true)
    expect(page2Elements.every((el) => el.userId >= 16 && el.userId <= 30)).toBe(true)
    expect(page3Elements.every((el) => el.userId >= 31 && el.userId <= 40)).toBe(true)
  })

  test('it updates the URL to reflect the most visible page during scrolling', async ({ page }) => {
    test.setTimeout(20_000)
    requests.listen(page)
    await page.goto('/infinite-scroll/update-query-string')

    // Initially should be on page 1 (no page param means page 1)
    expect(page.url()).not.toContain('page=')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll to bottom to load page 2
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom again to load page 3
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    // Test URL updates at different scroll positions using smooth scrolling
    await smoothScrollTo(page, 0)
    await expectQueryString(page, '1')

    await smoothScrollTo(page, Math.floor(pageHeight / 2))
    await expectQueryString(page, '2')

    await smoothScrollTo(page, pageHeight)
    await expectQueryString(page, '3')

    await smoothScrollTo(page, Math.floor(pageHeight / 2))
    await expectQueryString(page, '2')

    await smoothScrollTo(page, 0)
    await expectQueryString(page, '1')

    await smoothScrollTo(page, pageHeight)
    await expectQueryString(page, '3')
  })

  test('it preserves the original URL when preserveUrl is enabled', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/preserve-url?page=2')

    // Initially should be on page 2 and URL should be preserved
    expect(page.url()).toContain('page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    // Wait for page 1 to auto-load (trigger=both behavior)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom to load page 3
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    // Test multiple scroll positions - URL should never change from page=2
    await smoothScrollTo(page, 0) // Top
    await page.waitForTimeout(250) // Wait for debounce
    expect(page.url()).toContain('page=2')

    await smoothScrollTo(page, Math.floor(pageHeight / 2)) // Middle
    await page.waitForTimeout(250)
    expect(page.url()).toContain('page=2')

    await smoothScrollTo(page, pageHeight) // Bottom
    await page.waitForTimeout(250)
    expect(page.url()).toContain('page=2')

    await smoothScrollTo(page, 0) // Back to top
    await page.waitForTimeout(250)
    expect(page.url()).toContain('page=2')
  })
})

test.describe('Scroll position preservation', () => {
  async function screenshotAroundUserCard(page: Page, id: string, position: 'above' | 'below') {
    const viewport = page.viewportSize()

    if (!viewport) {
      throw new Error('Viewport size is not defined')
    }

    const userText = `User ${id}`
    const userCard = await page.getByText(userText)?.boundingBox()

    if (!userCard) {
      throw new Error(`Could not find bounding box for user with text "${userText}"`)
    }

    const clip = {
      x: 0,
      y: position === 'below' ? userCard.y + userCard.height : 0,
      width: viewport.width,
      height: position === 'below' ? viewport.height - (userCard.y + userCard.height) : viewport.height - userCard.y,
    }

    return async (p: Page, path?: string) => {
      await Promise.race([p.waitForLoadState('networkidle', { timeout: 1000 }).catch(() => {}), p.waitForTimeout(300)])
      await p.screenshot({ clip, path, animations: 'disabled', timeout: 10000 })
    }
  }

  const screenshotBelowUserCard = async (page: Page, id: string) => await screenshotAroundUserCard(page, id, 'below')
  const screenshotAboveUserCard = async (page: Page, id: string) => await screenshotAroundUserCard(page, id, 'above')

  test('it maintains scroll position when loading previous pages', async ({ page, context }) => {
    await page.goto('/infinite-scroll/trigger-both?page=3')

    // Wait for page 2 to load...
    await expect(page.getByText('User 16')).toBeVisible()

    // Scroll to the top of the page to load page 1
    await page.evaluate(() => window.scrollTo(0, 0))

    const screenshotter = await screenshotBelowUserCard(page, '16')
    const beforeScreenshot = await screenshotter(page)

    // Trigger load
    await page.evaluate(() => window.scrollTo(0, 0))

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    const afterScreenshot = await screenshotter(page)

    expect(afterScreenshot).toEqual(beforeScreenshot)
  })

  test('it maintains scroll position when loading next pages', async ({ page }) => {
    await page.goto('/infinite-scroll/trigger-both')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll to the bottom of the page to load page 2
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await expect(page.getByText('Loading...')).toBeVisible()
    const screenshotter = await screenshotAboveUserCard(page, '15')
    const beforeScreenshot = await screenshotter(page)

    // Wait for any initial loading to complete
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    const afterScreenshot = await screenshotter(page)

    expect(afterScreenshot).toEqual(beforeScreenshot)
  })

  test('it maintains scroll position when loading previous pages with buffer margin', async ({ page }) => {
    await page.goto('/infinite-scroll/trigger-start-buffer?page=3')

    // Wait for page 2 to load automatically...
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Get initial scroll position and User 16 position
    const initialScrollY = await page.evaluate(() => window.scrollY)
    const user16InitialPosition = await page.getByText('User 16').boundingBox()
    expect(user16InitialPosition).not.toBeNull()

    // Scroll to trigger buffer zone for loading page 1 (within 200px buffer)
    await page.evaluate(() => window.scrollTo(0, 100))

    // Wait a moment for buffer trigger to activate
    await page.waitForTimeout(100)

    // Wait for loading to start and complete
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Verify User 16 is still visible after page 1 loads (position preservation)
    await expect(page.getByText('User 16')).toBeVisible()

    // Verify the final scroll position accounts for new content
    const finalScrollY = await page.evaluate(() => window.scrollY)
    expect(finalScrollY).toBeGreaterThan(initialScrollY) // Should scroll down to maintain relative position

    // Verify all content is accessible
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible() // Page 3 content
    await expect(page.getByText('User 40')).toBeVisible()
  })

  test('it maintains scroll position when loading next pages with buffer margin', async ({ page }) => {
    await page.goto('/infinite-scroll/trigger-end-buffer')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll to bottom to trigger loading, similar to the working test
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await expect(page.getByText('Loading...')).toBeVisible()
    const screenshotter = await screenshotAboveUserCard(page, '15')
    const beforeScreenshot = await screenshotter(page)

    // Wait for loading to complete
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    const afterScreenshot = await screenshotter(page)

    expect(afterScreenshot).toEqual(beforeScreenshot)
  })
})

test.describe('Scrollable container support', () => {
  test('it loads pages in both directions when infinite scroll is within a scrollable container', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/scroll-container?page=2')

    // Get the scrollable container element
    const scrollContainer = page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    // Initially, page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    // It automatically loads page 1 because the start trigger is visible within the container
    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll within the container (not the page) to load page 3
    await scrollContainer.evaluate((container) => {
      container.scrollTop = container.scrollHeight
    })
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2)

    // Verify all three pages are now loaded within the container
    await expect(page.getByText('User 1', { exact: true })).toBeVisible() // Page 1
    await expect(page.getByText('User 20')).toBeVisible() // Page 2
    await expect(page.getByText('User 40')).toBeVisible() // Page 3

    // Verify the page itself hasn't scrolled - check that content below container is still visible
    await expect(page.getByText('Content below the scroll container')).toBeVisible()
  })

  test('it updates query parameters based on visible content within a scrollable container', async ({ page }) => {
    test.setTimeout(20_000)
    requests.listen(page)
    await page.goto('/infinite-scroll/scroll-container')

    // Initially should be on page 1 (no page param)
    expect(page.url()).not.toContain('page=')

    const scrollContainer = page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    // Load all 3 pages first
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll container to load page 2
    await scrollContainer.evaluate((container) => {
      container.scrollTop = container.scrollHeight
    })
    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    // Scroll container again to load page 3
    await scrollContainer.evaluate((container) => {
      container.scrollTop = container.scrollHeight
    })
    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    // Helper function to scroll container smoothly
    const smoothScrollContainerTo = async (targetY: number) => {
      await scrollContainer.evaluate((container, top) => container.scrollTo({ top, behavior: 'smooth' }), targetY)
      await page.waitForTimeout(250)
    }

    // Helper function to check URL updates with container scrolling
    const expectQueryStringInContainer = async (expectedPage: string) => {
      if (expectedPage === '1') {
        await page.waitForFunction(() => !window.location.search.includes('page='), { timeout: 800 })
        expect(page.url()).not.toContain('page=')
      } else {
        await page.waitForFunction((pageNum) => window.location.search.includes(`page=${pageNum}`), expectedPage, {
          timeout: 800,
        })
        expect(page.url()).toContain(`page=${expectedPage}`)
      }
    }

    const containerHeight = await scrollContainer.evaluate((container) => container.scrollHeight)

    // Test URL updates at different container scroll positions
    await smoothScrollContainerTo(0)
    await expectQueryStringInContainer('1')

    await smoothScrollContainerTo(Math.floor(containerHeight / 2))
    await expectQueryStringInContainer('2')

    await smoothScrollContainerTo(containerHeight)
    await expectQueryStringInContainer('3')

    await smoothScrollContainerTo(0)
    await expectQueryStringInContainer('1')
  })

  async function screenshotBelowUserCardInContainer(page: Page, scrollContainer: Locator, userId: string) {
    const containerRect = await scrollContainer.boundingBox()
    const userRect = await page.getByText(`User ${userId}`).boundingBox()

    if (!containerRect || !userRect) {
      throw new Error(`Could not get container or User ${userId} bounding box`)
    }

    // Calculate the area below the user within the container bounds
    const clip = {
      x: containerRect.x,
      y: userRect.y + userRect.height,
      width: containerRect.width,
      height: containerRect.y + containerRect.height - (userRect.y + userRect.height),
    }

    return async (p: Page, path?: string) => {
      await Promise.race([p.waitForLoadState('networkidle', { timeout: 1000 }).catch(() => {}), p.waitForTimeout(300)])
      await p.screenshot({ clip, path, animations: 'disabled', timeout: 10000 })
    }
  }

  test('it maintains scroll position when loading previous pages in container', async ({ page }) => {
    test.setTimeout(20_000)
    await page.goto('/infinite-scroll/scroll-container?page=3')

    const scrollContainer = page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    // Wait for page 2 to load automatically...
    await expect(page.getByText('User 16')).toBeVisible()

    // Scroll container to top to trigger loading page 1
    await scrollContainer.evaluate((container) => {
      container.scrollTop = 0
    })

    const screenshotter = await screenshotBelowUserCardInContainer(page, scrollContainer, '16')
    const beforeScreenshot = await screenshotter(
      page,
      'test-results/debug-screenshots/scroll-position-previous-before.png',
    )

    // Trigger load by scrolling to top
    await scrollContainer.evaluate((container) => {
      container.scrollTop = 0
    })

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    const afterScreenshot = await screenshotter(
      page,
      'test-results/debug-screenshots/scroll-position-previous-after.png',
    )

    expect(afterScreenshot).toEqual(beforeScreenshot)
  })

  test('it maintains scroll position when loading next pages in container', async ({ page }) => {
    test.setTimeout(20_000)
    await page.goto('/infinite-scroll/scroll-container')

    const scrollContainer = page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll down within container to see User 15
    await scrollContainer.evaluate((container) => {
      container.scrollTop = 100
    })

    const screenshotter = await screenshotBelowUserCardInContainer(page, scrollContainer, '15')
    const beforeScreenshot = await screenshotter(page, 'test-results/debug-screenshots/scroll-position-before.png')

    // Scroll container to bottom to trigger loading page 2
    await scrollContainer.evaluate((container) => {
      container.scrollTop = container.scrollHeight
    })

    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    const afterScreenshot = await screenshotter(page, 'test-results/debug-screenshots/scroll-position-after.png')

    expect(afterScreenshot).toEqual(beforeScreenshot)
  })
})

test.describe('Horizontal scrolling support', () => {
  test('it loads pages horizontally when scrolling right in a horizontal container', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/horizontal-scroll')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    const scrollContainer = page.locator('div[style*="overflow-x: scroll"]')

    await expect(infiniteScrollRequests().length).toBe(0)

    // Scroll right to trigger loading page 2
    await scrollContainer.evaluate((container) => (container.scrollLeft = container.scrollWidth))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll right again to trigger loading page 3
    await scrollContainer.evaluate((container) => (container.scrollLeft = container.scrollWidth))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    await expect(page.getByText('User 40')).toBeVisible()

    // Try scrolling right once more - should NOT trigger loading since User 40 is the last one
    await scrollContainer.evaluate((container) => (container.scrollLeft = container.scrollWidth))
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2) // Should still be 2, no additional request

    await page.waitForTimeout(300)
    expect(page.url()).toContain('page=3')

    // Check if the data-infinite-scroll attribute is set correctly for horizontal scroll
    const user15 = page.locator('[data-user-id="15"]')
    const user16 = page.locator('[data-user-id="16"]')
    const user30 = page.locator('[data-user-id="30"]')
    const user31 = page.locator('[data-user-id="31"]')
    const user40 = page.locator('[data-user-id="40"]')

    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user40).toHaveAttribute('data-infinite-scroll-page', '3')
  })
})

test.describe('Programmatic access via component ref', () => {
  test('it allows manual loading via ref methods', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/programmatic-ref?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()

    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load Previous (Ref)' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    await page.getByRole('button', { name: 'Load Next (Ref)' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it correctly reports hasMore states at page boundaries', async ({ page }) => {
    requests.listen(page)

    await page.goto('/infinite-scroll/programmatic-ref?page=1')
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.goto('/infinite-scroll/programmatic-ref?page=3')
    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()
  })
})

test.describe('Grid layout support', () => {
  test('it loads pages in a CSS grid layout', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/grid')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 60')).toBeVisible()
    await expect(page.getByText('User 61')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(0)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 61')).toBeVisible()
    await expect(page.getByText('User 120')).toBeVisible()
    await expect(page.getByText('User 121')).toBeHidden()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 121')).toBeVisible()
    await expect(page.getByText('User 180')).toBeVisible()
    await expect(page.getByText('User 181')).toBeHidden()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 181')).toBeVisible()
    await expect(page.getByText('User 240')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(3)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading more users...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(3)
  })
})

test.describe('Data table layout support', () => {
  test('it loads pages in a table layout with large datasets', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/data-table')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 250')).toBeVisible()
    await expect(page.getByText('User 251')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(0)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 251')).toBeVisible()
    await expect(page.getByText('User 500')).toBeVisible()
    await expect(page.getByText('User 501')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 501')).toBeVisible()
    await expect(page.getByText('User 750')).toBeVisible()
    await expect(page.getByText('User 751')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 751')).toBeVisible()
    await expect(page.getByText('User 1000')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(3)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(3)

    const user500 = page.locator('[data-user-id="500"]')
    const user501 = page.locator('[data-user-id="501"]')
    const user1000 = page.locator('[data-user-id="1000"]')

    await expect(user500).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user501).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user1000).toHaveAttribute('data-infinite-scroll-page', '4')
  })
})

test.describe('Empty dataset handling', () => {
  test('it handles empty datasets gracefully', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/empty')

    await expect(page.getByText('Empty Dataset Test')).toBeVisible()
    await expect(page.getByText('No users found.')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(0)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(0)

    await expect(page.getByText('No users found.')).toBeVisible()
  })
})

Object.entries({
  ref: '/infinite-scroll/custom-triggers-ref',
  selector: '/infinite-scroll/custom-triggers-selector',
  'ref-object': '/infinite-scroll/custom-triggers-ref-object',
}).forEach(([key, path]) => {
  test.describe('Custom triggers and slot using ' + key, () => {
    test('it loads pages when scrolling to custom triggers and updates URL', async ({ page }) => {
      requests.listen(page)
      await page.goto(path)

      // Initially should only see users 1-15
      await expect(page.getByText('User 1', { exact: true })).toBeVisible()
      await expect(page.getByText('User 15')).toBeVisible()
      await expect(page.getByText('User 16')).toBeHidden()

      // URL should not have page param initially
      expect(page.url()).not.toContain('page=')

      // Scroll to bottom to trigger loading users 16-30
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await expect(page.getByText('Loading...')).toBeVisible()
      await expect(page.getByText('User 16')).toBeVisible()
      await expect(page.getByText('User 30')).toBeVisible()
      await expect(page.getByText('Loading...')).toBeHidden()

      await expect(infiniteScrollRequests().length).toBe(1)

      // Load page 3 by scrolling to tfoot (custom after trigger)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500))

      await expect(page.getByText('Loading...')).toBeVisible()
      await expect(page.getByText('User 31')).toBeVisible()
      await expect(page.getByText('User 40')).toBeVisible()
      await expect(page.getByText('Loading...')).toBeHidden()

      await expect(infiniteScrollRequests().length).toBe(2)

      const pageHeight = await page.evaluate(() => document.body.scrollHeight)

      // Test URL updates at different scroll positions using smooth scrolling
      await smoothScrollTo(page, 0)
      await expectQueryString(page, '1')

      await smoothScrollTo(page, Math.floor(pageHeight / 2))
      await expectQueryString(page, '2')

      await smoothScrollTo(page, pageHeight)
      await expectQueryString(page, '3')

      await smoothScrollTo(page, 0)
      await expectQueryString(page, '1')
    })

    test('it auto-loads previous pages and responds to custom before trigger', async ({ page }) => {
      requests.listen(page)
      await page.goto(path + '?page=3')

      // Initially should see users 31-40
      await expect(page.getByText('User 31')).toBeVisible()
      await expect(page.getByText('User 40')).toBeVisible()
      await expect(page.getByText('User 30')).toBeHidden()

      // Page 2 should auto-load because the before trigger (thead) is visible
      await expect(page.getByText('User 30')).toBeVisible()
      await expect(page.getByText('User 16')).toBeVisible()
      await expect(page.getByText('User 15')).toBeHidden()

      await expect(infiniteScrollRequests().length).toBe(1)

      // Scroll up to thead to trigger loading page 1
      await page.evaluate(() => window.scrollTo(0, 500))

      await expect(page.getByText('User 15')).toBeVisible()
      await expect(page.getByText('User 1', { exact: true })).toBeVisible()

      await expect(infiniteScrollRequests().length).toBe(2)

      // Verify all three pages are loaded with correct data attributes
      const user1 = page.locator('[data-user-id="1"]')
      const user16 = page.locator('[data-user-id="16"]')
      const user40 = page.locator('[data-user-id="40"]')

      await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
      await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
      await expect(user40).toHaveAttribute('data-infinite-scroll-page', '3')
    })
  })
})
