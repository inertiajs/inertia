import { expect, test } from '@playwright/test'
import { consoleMessages, pageLoads } from './support'

test('it renders the children immediately and never shows the fallback', async ({ page }) => {
  pageLoads.watch(page, 1)
  consoleMessages.listen(page)

  await page.goto('/when-mounted')

  await expect(page.locator('#when-mounted-content')).toHaveText('Client path: /when-mounted')
  await expect(page.locator('#when-mounted-fallback')).toHaveCount(0)

  // A pure CSR app has no hydration pass, so the fallback never renders
  await expect(page.locator('#fallback-renders')).toHaveText('0')

  await page.locator('#revisit-link').click()
  await expect(page.locator('#when-mounted-content')).toHaveText('Client path: /when-mounted')
  await expect(page.locator('#fallback-renders')).toHaveText('0')

  await page.locator('#leave-link').click()
  await expect(page.getByText('This is the Test App Entrypoint page')).toBeVisible()

  await page.goBack()
  await expect(page.locator('#when-mounted-content')).toHaveText('Client path: /when-mounted')
  await expect(page.locator('#fallback-renders')).toHaveText('0')

  expect(pageLoads.count).toBe(1)
  expect(consoleMessages.errors).toHaveLength(0)
})

test('it remounts the child on an ordinary visit but keeps it mounted on a preserveState visit', async ({ page }) => {
  await page.goto('/when-mounted')
  await expect(page.locator('#child-status')).toHaveText('ready')
  await expect(page.locator('#child-mounts')).toHaveText('1')

  await page.locator('#child-increment').click()
  await expect(page.locator('#child-count')).toHaveText('1')

  await page.locator('#preserve-state-link').click()
  await expect(page.locator('#when-mounted-content')).toHaveText('Client path: /when-mounted')
  await expect(page.locator('#child-count')).toHaveText('1')
  await expect(page.locator('#child-mounts')).toHaveText('1')

  // Page keying remounts the child by design, WhenMounted only stops the fallback returning
  await page.locator('#revisit-link').click()
  await expect(page.locator('#child-mounts')).toHaveText('2')
  await expect(page.locator('#child-count')).toHaveText('0')
  await expect(page.locator('#child-status')).toHaveText('ready')
  await expect(page.locator('#fallback-renders')).toHaveText('0')
})
