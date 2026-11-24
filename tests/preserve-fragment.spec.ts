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

  test('it preserves the current URL fragment with Link preserveFragment', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/preserve-fragment#drawer-42')

    await page.locator('#link-preserve-fragment').click()
    await expect(page).toHaveURL('/preserve-fragment?status=open#drawer-42')
    await expect(page.locator('#current-url')).toHaveText('/preserve-fragment?status=open#drawer-42')
  })

  test('it preserves the current URL fragment with router.get preserveFragment', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/preserve-fragment#drawer-42')

    await page.locator('#visit-preserve-fragment').click()
    await expect(page).toHaveURL('/preserve-fragment?status=open#drawer-42')
    await expect(page.locator('#current-url')).toHaveText('/preserve-fragment?status=open#drawer-42')
  })

  test('it preserves the current URL fragment across redirects with visit preserveFragment without a server flag', async ({
    page,
  }) => {
    pageLoads.watch(page)
    await page.goto('/preserve-fragment#drawer-42')

    await page.locator('#redirect-preserve-fragment').click()
    await expect(page.locator('#target-text')).toHaveText('This is the target page')
    await expect(page).toHaveURL('/preserve-fragment/no-server-flag#drawer-42')
  })

  test('it drops the current URL fragment on query changes when preserveFragment is false', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/preserve-fragment#drawer-42')

    await page.locator('#visit-without-preserve-fragment').click()
    await expect(page).toHaveURL('/preserve-fragment?status=open')
    await expect(page.locator('#current-url')).toHaveText('/preserve-fragment?status=open')
  })
})
