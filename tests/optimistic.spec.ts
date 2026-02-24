import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Optimistic', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }, testInfo) => {
    await page
      .context()
      .addCookies([
        { name: 'optimistic-session', value: `worker-${testInfo.workerIndex}`, domain: 'localhost', path: '/' },
      ])

    await page.goto('/optimistic')
    await page.locator('#clear-btn').click()
    await expect(page.locator('#todo-list li')).toHaveCount(2)
  })

  test('it applies optimistic update immediately before request completes', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#new-todo').fill('New optimistic todo')
    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)
    await expect(page.locator('#todo-list')).toContainText('New optimistic todo')

    await expect(page.locator('#success-count')).toContainText('Success: 1')
    await expect(page.locator('#todo-list li')).toHaveCount(3)
  })

  test('it rolls back optimistic update on error and preserves validation errors', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)

    await expect(page.locator('#error-count')).toContainText('Error: 1')
    await expect(page.locator('#todo-list li')).toHaveCount(2)

    await expect(page.locator('.error')).toContainText('The name field is required.')
  })

  test('it only snapshots props that actually changed', async ({ page }) => {
    pageLoads.watch(page)

    await expect(page.locator('#server-timestamp')).not.toBeVisible()

    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)

    await expect(page.locator('#error-count')).toContainText('Error: 1')

    // 'todos' rolled back, but 'errors' and 'serverTimestamp' preserved from server
    await expect(page.locator('#todo-list li')).toHaveCount(2)
    await expect(page.locator('.error')).toContainText('The name field is required.')
    await expect(page.locator('#server-timestamp')).toBeVisible()
  })

  test('it rolls back optimistic update on server error (500)', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#server-error-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(3)
    await expect(page.locator('#todo-list')).toContainText('Will fail...')

    // Error modal contains an iframe
    await expect(page.locator('iframe')).toBeVisible()

    // Rolled back via onFinish (onSuccess never called for 500 errors)
    await expect(page.locator('#todo-list li')).toHaveCount(2)
    await expect(page.locator('#todo-list')).not.toContainText('Will fail...')
  })

  test('it completes both optimistic requests independently without cancelling', async ({ page }) => {
    pageLoads.watch(page)

    // Second click cancels first, restoring its state before applying own optimistic update
    await page.locator('#add-btn').click()
    await page.locator('#add-btn').click()

    await expect(page.locator('#todo-list li')).toHaveCount(4)
    await expect(page.locator('#error-count')).toContainText('Error: 2')
  })

  // Only the second request completes (first was cancelled)
  test('it does not cancel previous optimistic requests', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')

    await page.locator('#like-btn').click()
    await page.locator('#like-btn').click()
    await page.locator('#like-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 3')

    await page.waitForTimeout(1000)
    await expect(page.locator('#likes-count')).toContainText('Likes: 3')
  })

  test('it preserves optimistic state while requests are pending', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')

    await page.locator('#like-slow-btn').click()
    await page.locator('#like-fast-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    await page.waitForTimeout(300)
    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    await page.waitForTimeout(800)
    await expect(page.locator('#likes-count')).toContainText('Likes: 2')
  })

  test('it applies the last server response when all optimistic requests complete', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')

    // Server responds with likes=5 (slow) and likes=3 (fast)
    await page.locator('#like-controlled-slow-btn').click()
    await page.locator('#like-controlled-fast-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    await page.waitForTimeout(300)
    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    // Last server response wins
    await page.waitForTimeout(800)
    await expect(page.locator('#likes-count')).toContainText('Likes: 5')
  })

  test('it does not roll back when a newer optimistic update exists for the same prop', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')

    await page.locator('#like-error-btn').click()
    await page.locator('#like-controlled-slow-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    await page.waitForTimeout(300)
    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    await page.waitForTimeout(800)
    await expect(page.locator('#likes-count')).toContainText('Likes: 5')
  })

  test('it works when submitting to the same URL', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')

    await page.locator('#like-same-url-btn').click()
    await page.locator('#like-same-url-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 2')

    await page.waitForTimeout(800)
    await expect(page.locator('#likes-count')).toContainText('Likes: 2')
  })

  test('it completes optimistic request even when redirecting to a different page', async ({ page }) => {
    pageLoads.watch(page, 2)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')

    await page.locator('#like-and-redirect-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 1')

    await page.waitForURL('**/dump/get')
  })

  test('it updates non-optimistic props while preserving optimistic ones', async ({ page }) => {
    pageLoads.watch(page)

    await page.locator('#reset-likes-btn').click()
    await expect(page.locator('#likes-count')).toContainText('Likes: 0')
    await expect(page.locator('#foo-value')).toContainText('Foo: bar')

    await page.locator('#like-triple-btn').click()

    await expect(page.locator('#likes-count')).toContainText('Likes: 3')
    await expect(page.locator('#foo-value')).toContainText('Foo: bar')

    await page.waitForTimeout(500)
    await expect(page.locator('#likes-count')).toContainText('Likes: 3')
    await expect(page.locator('#foo-value')).toContainText('Foo: bar')

    // Non-optimistic prop (foo) updates from server while likes is preserved
    await page.waitForTimeout(300)
    await expect(page.locator('#likes-count')).toContainText('Likes: 3')
    await expect(page.locator('#foo-value')).toContainText('Foo: bar_updated')

    await page.waitForTimeout(300)
    await expect(page.locator('#likes-count')).toContainText('Likes: 3')
    await expect(page.locator('#foo-value')).toContainText('Foo: bar_updated_twice')
  })
})
