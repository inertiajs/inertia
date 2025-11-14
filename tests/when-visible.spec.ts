import { expect, test } from '@playwright/test'
import { requests } from './support'

test('it will wait to fire the reload until element is visible', async ({ page }) => {
  await page.goto('/when-visible')
  requests.listen(page)

  await page.evaluate(() => (window as any).scrollTo(0, 1000))
  await expect(requests.requests).toHaveLength(0)

  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(requests.requests).toHaveLength(0)

  await page.evaluate(() => (window as any).scrollTo(0, 5000))
  await expect(page.getByText('Loading first one...')).toBeVisible()
  await expect(page.getByText('First one is visible!')).not.toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading first one...')).not.toBeVisible()
  await expect(page.getByText('First one is visible!')).toBeVisible()

  // Scroll back up and then back down, make sure we don't re-request
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(requests.requests).toHaveLength(1)

  await page.evaluate(() => (window as any).scrollTo(0, 5000))
  await expect(requests.requests).toHaveLength(1)
  await expect(page.getByText('First one is visible!')).toBeVisible()

  requests.listen(page)

  await page.evaluate(() => (window as any).scrollTo(0, 6000))
  await expect(requests.requests).toHaveLength(0)

  // This one has a buffer of 1000
  await page.evaluate(() => (window as any).scrollTo(0, 9000))
  await expect(page.getByText('Loading second one...')).toBeVisible()
  await expect(page.getByText('Second one is visible!')).not.toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading second one...')).not.toBeVisible()
  await expect(page.getByText('Second one is visible!')).toBeVisible()

  // This one should trigger every time it's visible
  await page.evaluate(() => (window as any).scrollTo(0, 15_000))
  await expect(page.getByText('Loading third one...')).toBeVisible()
  await expect(page.getByText('Third one is visible!')).not.toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading third one...')).not.toBeVisible()
  await expect(page.getByText('Third one is visible!')).toBeVisible()

  // Now scroll up and down to re-trigger it
  await page.evaluate(() => (window as any).scrollTo(0, 13_000))
  await page.waitForTimeout(100)

  await page.evaluate(() => (window as any).scrollTo(0, 15_000))
  await expect(page.getByText('Third one is visible!')).toBeVisible()
  await page.waitForResponse(page.url())

  await page.evaluate(() => (window as any).scrollTo(0, 13_000))
  await page.waitForTimeout(100)

  await page.evaluate(() => (window as any).scrollTo(0, 15_000))
  await expect(page.getByText('Third one is visible!')).toBeVisible()
  await page.waitForResponse(page.url())

  await page.evaluate(() => (window as any).scrollTo(0, 20_000))
  await expect(page.getByText('Loading fourth one...')).toBeVisible()
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading fourth one...')).not.toBeVisible()

  await page.evaluate(() => (window as any).scrollTo(0, 26_000))
  await expect(page.getByText('Loading fifth one...')).toBeVisible()
  await page.waitForResponse(page.url() + '?count=0')
  await expect(page.getByText('Loading fifth one...')).not.toBeVisible()
  await expect(page.getByText('Count is now 1')).toBeVisible()

  // Now scroll up and down to re-trigger it
  await page.evaluate(() => (window as any).scrollTo(0, 20_000))
  await page.waitForTimeout(100)

  await page.evaluate(() => (window as any).scrollTo(0, 26_000))
  await expect(page.getByText('Count is now 1')).toBeVisible()
  await page.waitForResponse(page.url() + '?count=1')
  await expect(page.getByText('Count is now 2')).toBeVisible()
})

test('it will reload again when the prop value is set to undefined (e.g. page reload)', async ({ page }) => {
  await page.goto('/when-visible-reload')
  requests.listen(page)

  // Initial load - lazyData should be missing
  await expect(page.getByText('This is lazy loaded data!')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component
  await page.evaluate(() => (window as any).scrollTo(0, 3000))
  await expect(page.getByText('Loading lazy data...')).toBeVisible()

  // Wait for lazy data to load
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  await expect(page.getByText('This is lazy loaded data!')).toBeVisible()

  await page.evaluate(() => (window as any).scrollTo(0, 0))

  // Click the reload button to trigger the issue
  await page.getByRole('button', { name: 'Reload Page' }).click()

  // Lazily loaded data should be missing again after reload
  await expect(page.getByText('Loading lazy data...')).toBeVisible()
  await expect(page.getByText('This is lazy loaded data!')).not.toBeVisible()

  // Scroll to trigger the WhenVisible component again
  await page.evaluate(() => (window as any).scrollTo(0, 3000))

  // Wait for lazy data to load again
  await page.waitForResponse(page.url())
  await expect(page.getByText('Loading lazy data...')).not.toBeVisible()
  await expect(page.getByText('This is lazy loaded data!')).toBeVisible()
})
