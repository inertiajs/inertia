import { expect, test } from '@playwright/test'

// WebKit has a ~64MB limit on history.state storage.
// Chromium and Firefox have virtually unlimited storage.
// When quota is exceeded, Inertia falls back to a full page reload.
test.describe('history quota exceeded', () => {
  test.setTimeout(10_000)

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific quota limit')

    await page.goto('/history-quota/1')
  })

  test('it performs a full page reload when quota is exceeded', async ({ page }) => {
    let fullReloadAtPage = 0
    let loadCount = 0

    // Track page load events
    page.on('load', () => {
      loadCount++
    })

    for (let i = 2; i <= 20; i++) {
      const loadsBefore = loadCount

      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      // If load count increased, it was a full page reload
      if (loadCount > loadsBefore) {
        fullReloadAtPage = i
        break
      }
    }

    // Should have triggered a full reload at some point
    expect(fullReloadAtPage).toBeGreaterThan(0)

    // And we should still be on the correct page
    await expect(page.getByText(`History Quota Test - Page ${fullReloadAtPage}`)).toBeVisible()
  })

  test('navigation continues to work after quota-triggered reload', async ({ page }) => {
    let reloadHappened = false

    page.on('load', () => {
      reloadHappened = true
    })

    // Navigate until we trigger a full reload
    for (let i = 2; i <= 20; i++) {
      reloadHappened = false

      await page.click(`text=Page ${i}`)
      await page.waitForURL(`/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      if (reloadHappened) {
        // After a full reload, try one more navigation to verify it still works
        const nextPage = i + 1
        await page.click(`text=Page ${nextPage}`)
        await page.waitForURL(`/history-quota/${nextPage}`)
        await expect(page.getByText(`History Quota Test - Page ${nextPage}`)).toBeVisible()
        return
      }
    }

    throw new Error('Expected a full page reload to occur')
  })
})
