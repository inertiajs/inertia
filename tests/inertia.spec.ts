import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('mounts the initial page', async ({ page }) => {
  await expect(page.locator('#app')).toContainText('This is the Test App Entrypoint page')
})
