import { expect, test } from '@playwright/test'
import { requests } from './support'

// WebKit has a ~64MB limit on history.state storage.
// Chromium and Firefox have virtually unlimited storage.
test.describe('history quota exceeded', () => {
  test.setTimeout(10_000)

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific quota limit')

    await page.goto('/history-quota/1')
  })

  test('it falls back to refetching when quota is exceeded', async ({ page }) => {
    let quotaExceededAtPage = 0

    for (let i = 2; i <= 10; i++) {
      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      const hasPageData = await page.evaluate(() => !!window.history.state?.page)

      if (!hasPageData) {
        quotaExceededAtPage = i
        break
      }
    }

    expect(quotaExceededAtPage).toBeGreaterThan(0)

    requests.listen(page)

    await page.goBack()
    await page.waitForURL(`/history-quota/${quotaExceededAtPage - 1}`)
    await expect(page.getByText(`History Quota Test - Page ${quotaExceededAtPage - 1}`)).toBeVisible()

    // Page before quota should restore from history
    expect(requests.requests).toHaveLength(0)

    requests.listen(page)

    await page.goForward()
    await page.waitForURL(`/history-quota/${quotaExceededAtPage}`)
    await expect(page.getByText(`History Quota Test - Page ${quotaExceededAtPage}`)).toBeVisible()

    // Page after quota should be refetched
    expect(requests.requests.length).toBeGreaterThan(0)
  })

  test('it stores minimal state without page data when quota is exceeded', async ({ page }) => {
    for (let i = 2; i <= 10; i++) {
      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)

      const state = await page.evaluate(() => window.history.state)

      if (!state?.page) {
        expect(state).toBeDefined()
        expect(state.page).toBeUndefined()
        return
      }
    }

    throw new Error('Expected quota to be exceeded')
  })

  test('it can continue navigating after quota is exceeded', async ({ page }) => {
    let quotaExceededAtPage = 0

    // Navigate until quota is exceeded
    for (let i = 2; i <= 10; i++) {
      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)

      const hasPageData = await page.evaluate(() => !!window.history.state?.page)

      if (!hasPageData) {
        quotaExceededAtPage = i
        break
      }
    }

    expect(quotaExceededAtPage).toBeGreaterThan(0)

    // Continue navigating 10 more pages - all should work with empty state
    for (let i = quotaExceededAtPage + 1; i <= quotaExceededAtPage + 100; i++) {
      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      // Should still be able to push empty state
      const state = await page.evaluate(() => window.history.state)
      expect(state).toBeDefined()
    }

    const currentPageUrl = await page.url()
    expect(currentPageUrl).toBe(`/history-quota/${quotaExceededAtPage + 1000}`)

    // Navigate back...
    await page.goBack()
    await page.waitForURL(`/history-quota/${quotaExceededAtPage + 999}`)
    await expect(page.getByText(`History Quota Test - Page ${quotaExceededAtPage + 999}`)).toBeVisible()
  })

  test('it restores scroll position after refetch', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 150))
    await page.waitForTimeout(200)

    let quotaExceededAtPage = 0

    for (let i = 2; i <= 10; i++) {
      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)

      const hasPageData = await page.evaluate(() => !!window.history.state?.page)

      if (!hasPageData) {
        quotaExceededAtPage = i
        break
      }
    }

    expect(quotaExceededAtPage).toBeGreaterThan(0)

    for (let i = quotaExceededAtPage - 1; i >= 1; i--) {
      await page.goBack()
      await page.waitForURL(`/history-quota/${i}`)
    }

    const scrollTop = await page.evaluate(() => window.scrollY)
    expect(scrollTop).toBe(150)
  })
})
