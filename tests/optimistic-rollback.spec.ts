import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Optimistic Rollback', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }, testInfo) => {
    await page
      .context()
      .addCookies([
        { name: 'optimistic-session', value: `rollback-${testInfo.workerIndex}`, domain: 'localhost', path: '/' },
      ])

    await page.goto('/optimistic/rollback')
    await page.locator('#reset-btn').click()
    await expect(page.locator('.contact-status').first()).toContainText('Not Favorite')
  })

  test('it fully rolls back multiple optimistic updates on the same prop when all requests error', async ({ page }) => {
    pageLoads.watch(page)

    await expect(page.locator('.contact-status').nth(0)).toContainText('Not Favorite')
    await expect(page.locator('.contact-status').nth(1)).toContainText('Not Favorite')
    await expect(page.locator('.contact-status').nth(2)).toContainText('Not Favorite')

    await page.locator('.toggle-error-btn').nth(0).click()
    await page.locator('.toggle-error-btn').nth(1).click()
    await page.locator('.toggle-error-btn').nth(2).click()

    await expect(page.locator('.contact-status').nth(0)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(1)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(2)).toContainText('Favorite')

    await page.waitForTimeout(2000)

    await expect(page.locator('.contact-status').nth(0)).toContainText('Not Favorite')
    await expect(page.locator('.contact-status').nth(1)).toContainText('Not Favorite')
    await expect(page.locator('.contact-status').nth(2)).toContainText('Not Favorite')
  })

  test('it preserves confirmed server state and pending optimistic updates when rolling back a failed request', async ({
    page,
  }) => {
    pageLoads.watch(page)

    // Request 1: toggle John (slow, in flight the whole time)
    await page.locator('.toggle-slow-btn').nth(0).click()

    // Request 2: toggle Jane (fast, will succeed)
    await page.locator('.toggle-btn').nth(1).click()

    // Request 3: toggle Bob (slow, will error)
    await page.locator('.toggle-slow-error-btn').nth(2).click()

    await expect(page.locator('.contact-status').nth(0)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(1)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(2)).toContainText('Favorite')

    // Request 2 completes (fast success), optimistic states preserved
    await page.waitForTimeout(700)
    await expect(page.locator('.contact-status').nth(0)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(1)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(2)).toContainText('Favorite')

    // Requests 1 and 3 complete (slow). Request 3 fails and rolls back Bob,
    // but preserves John (confirmed by request 1) and Jane (confirmed by request 2)
    await page.waitForTimeout(800)
    await expect(page.locator('.contact-status').nth(0)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(1)).toContainText('Favorite')
    await expect(page.locator('.contact-status').nth(2)).toContainText('Not Favorite')
  })
})
