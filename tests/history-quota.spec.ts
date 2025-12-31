import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

// WebKit has a ~64MB limit on history.state storage.
// Chromium and Firefox have virtually unlimited storage.
test.describe('history quota exceeded', () => {
  test.setTimeout(10_000)

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific quota limit')

    await page.goto('/history-quota/1')
  })

  test('it performs a full page reload when quota is exceeded', async ({ page }) => {
    let fullReloadAtPage = 0
    let loadCount = 0

    page.on('load', () => {
      loadCount++
    })

    for (let i = 2; i <= 20; i++) {
      const loadsBefore = loadCount

      await clickAndWaitForResponse(page, `Page ${i}`, `/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      if (loadCount > loadsBefore) {
        fullReloadAtPage = i
        break
      }
    }

    expect(fullReloadAtPage).toBeGreaterThan(0)
    await expect(page.getByText(`History Quota Test - Page ${fullReloadAtPage}`)).toBeVisible()
  })

  test('navigation continues to work after quota-triggered reload', async ({ page }) => {
    let reloadHappened = false

    page.on('load', () => {
      reloadHappened = true
    })

    for (let i = 2; i <= 20; i++) {
      reloadHappened = false

      await clickAndWaitForResponse(page, `Page ${i}`, `/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      if (reloadHappened) {
        const nextPage = i + 1
        await clickAndWaitForResponse(page, `Page ${nextPage}`, `/history-quota/${nextPage}`)
        await expect(page.getByText(`History Quota Test - Page ${nextPage}`)).toBeVisible()
        return
      }
    }

    throw new Error('Expected a full page reload to occur')
  })

  test('back and forward navigation works after quota is exceeded', async ({ page }) => {
    let reloadHappened = false
    let reloadAtPage = 0

    page.on('load', () => {
      reloadHappened = true
    })

    for (let i = 2; i <= 20; i++) {
      reloadHappened = false

      await clickAndWaitForResponse(page, `Page ${i}`, `/history-quota/${i}`)
      await expect(page.getByText(`History Quota Test - Page ${i}`)).toBeVisible()

      if (reloadHappened) {
        reloadAtPage = i
        break
      }
    }

    expect(reloadAtPage).toBeGreaterThan(0)

    const pageAfterReload = reloadAtPage + 1
    await clickAndWaitForResponse(page, `Page ${pageAfterReload}`, `/history-quota/${pageAfterReload}`)
    await expect(page.getByText(`History Quota Test - Page ${pageAfterReload}`)).toBeVisible()

    await page.goBack()
    await page.waitForURL(`/history-quota/${reloadAtPage}`)
    await expect(page.getByText(`History Quota Test - Page ${reloadAtPage}`)).toBeVisible()

    await page.goBack()
    await page.waitForURL(`/history-quota/${reloadAtPage - 1}`)
    await expect(page.getByText(`History Quota Test - Page ${reloadAtPage - 1}`)).toBeVisible()

    await page.goForward()
    await page.waitForURL(`/history-quota/${reloadAtPage}`)
    await expect(page.getByText(`History Quota Test - Page ${reloadAtPage}`)).toBeVisible()

    await page.goForward()
    await page.waitForURL(`/history-quota/${pageAfterReload}`)
    await expect(page.getByText(`History Quota Test - Page ${pageAfterReload}`)).toBeVisible()
  })
})
