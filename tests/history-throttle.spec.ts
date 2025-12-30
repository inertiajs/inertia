import { expect, test } from '@playwright/test'
import { consoleMessages, isWebKit, pageLoads } from './support'

test.describe('History API throttle', () => {
  test('should handle rapid replaceState calls without crashing and continue navigating', async ({ page }) => {
    consoleMessages.listen(page)
    pageLoads.watch(page)

    await page.goto('/history-throttle')
    await page.click('#trigger')
    await expect(page.locator('#call-count')).toContainText('State updates: 120')

    // Check for Safari's throttle error
    const throttleErrors = consoleMessages.errors.filter(
      (msg) =>
        msg.includes('history.replaceState') ||
        msg.includes('history.pushState') ||
        msg.includes('SecurityError') ||
        msg.includes('100 times'),
    )

    expect(throttleErrors, 'History API throttle errors should not occur').toHaveLength(0)

    const throttleLogs = consoleMessages.messages.filter(
      (msg) =>
        msg.includes('history.replaceState') ||
        msg.includes('history.pushState') ||
        msg.includes('SecurityError') ||
        msg.includes('100 times'),
    )

    if (isWebKit(page)) {
      expect(throttleLogs[0]).toContain('100 times')
    }

    // Verify navigation still works after throttling
    await page.click('#home-link')
    await expect(page.locator('.text')).toContainText('This is the Test App Entrypoint page')
  })
})
