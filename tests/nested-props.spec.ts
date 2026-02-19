import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse, requests } from './support'

test('it can load nested deferred props without clobbering siblings', async ({ page }) => {
  await page.goto('/nested-props/deferred')

  await expect(page.locator('#user')).toContainText('User: John Doe')

  await expect(page.locator('#notifications')).toContainText(
    'Notifications: Notification 1, Notification 2, Notification 3',
  )

  // Sibling prop is preserved after deferred prop loads
  await expect(page.locator('#user')).toContainText('User: John Doe')
})

test('it can append to nested merge props', async ({ page }) => {
  await page.goto('/nested-props/merge')

  await expect(page.locator('#posts')).toContainText('Post 1, Post 2, Post 3')
  await expect(page.locator('#meta')).toContainText('Page: 1')

  await clickAndWaitForResponse(page, 'Load More', '/nested-props/merge?page=2', 'button')

  await expect(page.locator('#posts')).toContainText('Post 1, Post 2, Post 3, Post 4, Post 5, Post 6')
  await expect(page.locator('#meta')).toContainText('Page: 2')
})

test('it can prepend to nested merge props', async ({ page }) => {
  await page.goto('/nested-props/prepend')

  await expect(page.locator('#posts')).toContainText('Post 3, Post 2, Post 1')
  await expect(page.locator('#meta')).toContainText('Page: 1')

  await clickAndWaitForResponse(page, 'Load More', '/nested-props/prepend?page=2', 'button')

  await expect(page.locator('#posts')).toContainText('Post 6, Post 5, Post 4, Post 3, Post 2, Post 1')
  await expect(page.locator('#meta')).toContainText('Page: 2')
})

test('it preserves nested once props on reload', async ({ page }) => {
  requests.listen(page)

  await page.goto('/nested-props/once')

  const initialLocale = await page.locator('#locale').textContent()
  expect(initialLocale).toContain('Locale: en-')
  await expect(page.locator('#timezone')).toContainText('Timezone: UTC')

  await clickAndWaitForResponse(page, 'Reload', '/nested-props/once', 'button')

  // The locale should be preserved (same value as initial)
  await expect(page.locator('#locale')).toContainText(initialLocale!)
  await expect(page.locator('#timezone')).toContainText('Timezone: UTC')

  // Verify the once prop header was sent
  const reloadRequest = requests.requests.find(
    (r) => r.url().includes('/nested-props/once') && r.headers()['x-inertia-except-once-props'],
  )

  expect(reloadRequest).toBeDefined()
  expect(reloadRequest!.headers()['x-inertia-except-once-props']).toContain('config.locale')
})

test('it can deep merge nested props', async ({ page }) => {
  await page.goto('/nested-props/deep-merge')

  await expect(page.locator('#items')).toContainText('Item 1, Item 2')
  await expect(page.locator('#label')).toContainText('Label: Page 1')

  await clickAndWaitForResponse(page, 'Load More', '/nested-props/deep-merge?page=2', 'button')

  await expect(page.locator('#items')).toContainText('Item 1, Item 2, Item 3, Item 4')
  await expect(page.locator('#label')).toContainText('Label: Page 2')
})

test('it preserves parent props when reloading a deeply nested dot-notation prop', async ({ page }) => {
  await page.goto('/nested-props/shared-dot-props')

  await expect(page.locator('#name')).toContainText('Name: John Doe')
  await expect(page.locator('#email')).toContainText('Email: john@example.com')
  await expect(page.locator('#permissions')).toContainText('Permissions: edit-posts, delete-posts, create-posts')

  await clickAndWaitForResponse(page, 'Reload Permissions', '/nested-props/shared-dot-props', 'button')

  // Siblings at the same level must be preserved
  await expect(page.locator('#name')).toContainText('Name: John Doe')
  await expect(page.locator('#email')).toContainText('Email: john@example.com')
  await expect(page.locator('#permissions')).toContainText('Permissions: edit-posts, delete-posts, create-posts')
})

test('it preserves sibling props when loading multiple nested deferred props', async ({ page }) => {
  await page.goto('/nested-props/deferred-with-siblings')

  await expect(page.locator('#user')).toContainText('User: John Doe (john@example.com)')
  await expect(page.locator('#token')).toContainText('Token: abc-123')

  await expect(page.locator('#notifications')).toContainText(
    'Notifications: You have a new follower, Your post was liked',
  )
  await expect(page.locator('#roles')).toContainText('Roles: admin, editor')

  // All sibling props must still be intact after deferred props loaded
  await expect(page.locator('#user')).toContainText('User: John Doe (john@example.com)')
  await expect(page.locator('#token')).toContainText('Token: abc-123')
})

test('it can use WhenVisible with nested dot-notation data prop', async ({ page }) => {
  await page.goto('/nested-props/when-visible')

  await expect(page.locator('#visitors')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(page.locator('#loading')).toBeVisible()

  await page.waitForResponse(page.url())
  await expect(page.locator('#loading')).not.toBeVisible()
  await expect(page.locator('#visitors')).toContainText('Visitors: 1250')
})
