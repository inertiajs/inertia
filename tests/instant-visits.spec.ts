import test, { expect } from '@playwright/test'
import { pageLoads, requests } from './support'

test('it instantly swaps to the target component before the server responds', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')
  await expect(page.locator('#page1')).toBeVisible()

  requests.listen(page)

  await page.getByRole('button', { exact: true, name: 'Visit with component' }).click()

  // Component swaps immediately before server responds
  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: none')
  await expect(page.locator('#timestamp')).toContainText('Timestamp: none')

  // Wait for the server response to fill in props
  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
  await expect(page.locator('#timestamp')).not.toContainText('Timestamp: none')
})

test('it passes pageProps as placeholder data during instant swap', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit with component and pageProps' }).click()

  // Placeholder props are available immediately
  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: Placeholder greeting')
  await expect(page.locator('#timestamp')).toContainText('Timestamp: none')

  // Server response replaces placeholder props
  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
  await expect(page.locator('#timestamp')).not.toContainText('Timestamp: none')
})

test('it accepts a pageProps callback that receives current props', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit with pageProps callback' }).click()

  // Callback receives current page's props and uses them as placeholder
  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: Was on page with foo: foo from server')

  // Server response replaces placeholder props
  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it handles server redirects after instant swap', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit redirecting' }).click()

  // Instantly swaps to the Target component
  await expect(page.locator('#target')).toBeVisible()

  // Server redirects to RedirectTarget, which replaces the intermediate page
  await page.waitForResponse('**/instant-visit/redirect-target**')

  await expect(page.locator('#redirect-target')).toBeVisible()
  await expect(page.locator('#redirected')).toContainText('Redirected: true')
  await expect(page).toHaveURL(/\/instant-visit\/redirect-target/)
})

test('it works with the Link component prop', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('link', { exact: true, name: 'Link with component' }).click()

  // Component swaps immediately
  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: none')

  // Server response fills in props
  await page.waitForResponse('**/instant-visit/target**')

  await expect(page.locator('#greeting')).toContainText('Greeting: Hello from server')
})

test('it works with the Link clientSide prop and UrlMethodPair', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('link', { exact: true, name: 'Link with clientSide' }).click()

  // Component swaps immediately from UrlMethodPair.component
  await expect(page.locator('#target')).toBeVisible()
  await expect(page.locator('#greeting')).toContainText('Greeting: none')

  // Server response fills in props
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

  // Go back to the original page
  await page.goBack()

  await expect(page.locator('#page1')).toBeVisible()
  await expect(page).toHaveURL(/\/instant-visit$/)
})

test('it works with deferred props', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/instant-visit')

  await page.getByRole('button', { exact: true, name: 'Visit deferred' }).click()

  // Instantly swaps to Deferred component with placeholder title
  await expect(page.locator('#deferred')).toBeVisible()
  await expect(page.locator('#title')).toContainText('Title: Placeholder Title')
  await expect(page.locator('#heavy-loading')).toBeVisible()

  // Server response arrives with real title and deferred props trigger
  await page.waitForResponse('**/instant-visit/deferred**')

  await expect(page.locator('#title')).toContainText('Title: Deferred Page')

  // Deferred prop loads asynchronously
  await expect(page.locator('#heavy-data')).toContainText('Heavy: loaded via deferred')
})
