import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test.describe('retain fragment', () => {
  test('it retains the URL fragment across redirects when retainFragment is true', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/retain-fragment')

    await page.getByRole('link', { name: 'Link with fragment' }).click()
    await expect(page.locator('#target-text')).toHaveText('This is the target page')
    await expect(page).toHaveURL('/retain-fragment/target#my-fragment')
  })

  test('it retains the URL fragment across redirects with router.visit', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/retain-fragment')

    await page.locator('#manual-visit-with-fragment').click()
    await expect(page.locator('#target-text')).toHaveText('This is the target page')
    await expect(page).toHaveURL('/retain-fragment/target#my-fragment')
  })
})
