import test, { expect } from '@playwright/test'

test('it passes page object to resolver', async ({ page }) => {
  await page.goto('/')

  let resolverPage = await page.evaluate(() => window.resolverReceivedPage)
  expect(resolverPage?.component).toBe('Home')
  expect(resolverPage?.url).toBe('/')

  // Navigate and verify resolver receives new page
  await page.click('.links-method')
  await page.waitForURL('/links/method')

  resolverPage = await page.evaluate(() => window.resolverReceivedPage)
  expect(resolverPage?.component).toBe('Links/Method')
  expect(resolverPage?.url).toBe('/links/method')
})
