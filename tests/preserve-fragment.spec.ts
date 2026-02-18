import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test.describe('preserve fragment', () => {
  test('it preserves the URL fragment across redirects when preserveFragment is true', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/preserve-fragment')

    await page.getByRole('link', { name: 'Link with fragment' }).click()
    await expect(page.locator('#target-text')).toHaveText('This is the target page')
    await expect(page).toHaveURL('/preserve-fragment/target#my-fragment')
  })

  test('it preserves the URL fragment across redirects with router.visit', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/preserve-fragment')

    await page.locator('#manual-visit-with-fragment').click()
    await expect(page.locator('#target-text')).toHaveText('This is the target page')
    await expect(page).toHaveURL('/preserve-fragment/target#my-fragment')
  })
})
