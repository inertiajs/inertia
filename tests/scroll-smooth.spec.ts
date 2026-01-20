import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test.describe('scroll-smooth', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
  })

  test('it resets scroll position when navigating from a long page to a short page with scroll-smooth CSS', async ({
    page,
  }) => {
    // Start on the long page
    await page.goto('/scroll-smooth/long')
    await expect(page.getByRole('heading', { name: 'Long Page' })).toBeVisible()

    // Scroll to the bottom of the page (use instant to avoid smooth scroll delay)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(100)

    // Verify we scrolled down
    const scrollYBeforeNavigation = await page.evaluate(() => window.scrollY)
    expect(scrollYBeforeNavigation).toBeGreaterThan(500)

    // Click the link to go to the short page
    await page.getByRole('link', { name: 'Go to Short Page' }).click()
    await expect(page.getByRole('heading', { name: 'Short Page' })).toBeVisible()

    // Wait for smooth scroll animation to complete
    await page.waitForTimeout(500)

    // Verify scroll position was reset to top (allow small tolerance for smooth scroll)
    const scrollYAfterNavigation = await page.evaluate(() => window.scrollY)
    expect(scrollYAfterNavigation).toBeLessThan(10)
  })

  test('it resets scroll position when navigating from a short page to a long page with scroll-smooth CSS', async ({
    page,
  }) => {
    // Start on the short page
    await page.goto('/scroll-smooth/short')
    await expect(page.getByRole('heading', { name: 'Short Page' })).toBeVisible()

    // Click the link to go to the long page
    await page.getByRole('link', { name: 'Go to Long Page' }).click()
    await expect(page.getByRole('heading', { name: 'Long Page' })).toBeVisible()

    // Wait for smooth scroll animation to complete
    await page.waitForTimeout(500)

    // Verify scroll position is at top (allow small tolerance for smooth scroll)
    const scrollYAfterNavigation = await page.evaluate(() => window.scrollY)
    expect(scrollYAfterNavigation).toBeLessThan(10)
  })
})
