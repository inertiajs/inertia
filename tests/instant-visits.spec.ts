import test, { expect } from '@playwright/test'
import { pageLoads, requests } from './support'

test('it instantly swaps to the target component before the server responds', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#page1')).toBeVisible()

  requests.listen(page)

  await page.getByRole('button', { exact: true, name: 'Visit with component' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: none')
  await expect(page.locator('#timestamp')).toContainText('Timestamp: none')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
  await expect(page.locator('#timestamp')).not.toContainText('Timestamp: none')
})

test('it passes pageProps as placeholder data during instant swap', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit with component and pageProps' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: Placeholder greeting')
  await expect(page.locator('#timestamp')).toContainText('Timestamp: none')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
  await expect(page.locator('#timestamp')).not.toContainText('Timestamp: none')
})

test('it accepts a pageProps callback that receives current props', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit with pageProps callback' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: Was on page with foo: foo from server')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it handles server redirects after instant swap', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit redirecting' }).click()

  await expect(page.locator('#target')).toBeVisible()

  await page.waitForResponse('**/instant-visit/redirect-target**')

  await expect(page.locator('#redirect-target')).toBeVisible()
  await expect(page.locator('#redirected')).toContainText('Redirected: true')
  await expect(page).toHaveURL(/\/instant-visit\/redirect-target/)
})

test('it works with the Link component prop', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('link', { exact: true, name: 'Link with component' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: none')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it works with the Link clientSide prop and UrlMethodPair', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('link', { exact: true, name: 'Link with clientSide' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: none')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it replaces the history entry so back navigation works correctly', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#page1')).toBeVisible()

  await page.getByRole('button', { exact: true, name: 'Visit with component' }).click()
  await expect(page.locator('#target')).toBeVisible()

  await page.waitForResponse('**/instant-visit/target**')
  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')

  await page.goBack()

  await expect(page.locator('#page1')).toBeVisible()
  await expect(page).toHaveURL(/\/instant-visit$/)
})

test('it works with deferred props', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit deferred' }).click()

  await expect(page.locator('#deferred')).toBeVisible()
  await expect(page.locator('#title')).toContainText('Title: Placeholder Title')
  await expect(page.locator('#heavy-loading')).toBeVisible()

  await page.waitForResponse('**/instant-visit/deferred**')

  await expect(page.locator('#title')).toContainText('Title: Deferred Page')
  await expect(page.locator('#heavy-data')).toContainText('Heavy: loaded via deferred')
})

test('it carries over shared props automatically when no pageProps is provided', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#auth')).toContainText('Auth: John')

  await page.getByRole('button', { exact: true, name: 'Visit with component' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#auth')).toContainText('Auth: John')
  await expect(page.locator('#greeting')).toContainText('Greeting: none')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#auth')).toContainText('Auth: John')
  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it does not carry over shared props when pageProps object is provided', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#auth')).toContainText('Auth: John')

  await page.getByRole('button', { exact: true, name: 'Visit with component and pageProps' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#auth')).toContainText('Auth: none')
  await expect(page.locator('#greeting')).toContainText('Greeting: Placeholder greeting')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#auth')).toContainText('Auth: John')
  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it passes shared props as second argument to pageProps callback', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#auth')).toContainText('Auth: John')

  await page.getByRole('button', { exact: true, name: 'Visit with pageProps callback using shared' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#auth')).toContainText('Auth: John')
  await expect(page.locator('#greeting')).toContainText('Greeting: Placeholder with shared')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#auth')).toContainText('Auth: John')
  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it does not carry over shared props when pageProps callback is provided without spreading them', async ({
  page,
}) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#auth')).toContainText('Auth: John')

  await page.getByRole('button', { exact: true, name: 'Visit with pageProps callback' }).click()

  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#auth')).toContainText('Auth: none')
  await expect(page.locator('#greeting')).toContainText('Greeting: Was on page with foo: foo from server')

  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#auth')).toContainText('Auth: John')
})
