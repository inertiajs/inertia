import test, { expect } from '@playwright/test'

test.describe('Resolver receives page parameter', () => {
  test('it passes the page object to the resolver on initial load', async ({ page }) => {
    await page.goto('/resolver-page')

    await expect(page.locator('#resolver-component')).toContainText('Component: ResolverPage/Index')
    await expect(page.locator('#resolver-url')).toContainText('URL: /resolver-page')
  })

  test('it passes the page object to the resolver on navigation', async ({ page }) => {
    await page.goto('/resolver-page')

    await expect(page.locator('#resolver-component')).toContainText('Component: ResolverPage/Index')

    await page.click('#go-to-second')

    await expect(page.locator('#resolver-component')).toContainText('Component: ResolverPage/Second')
    await expect(page.locator('#resolver-url')).toContainText('URL: /resolver-page/second')
  })
})
