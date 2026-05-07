import { expect, test } from '@playwright/test'
import { requests } from './support'

test('it cancels a visit and fires both onCancel and onTimeout when the timeout option elapses', async ({ page }) => {
  test.setTimeout(10000)

  await page.goto('/visit/timeout')

  await expect(page.locator('#status')).toHaveText('idle')

  await page.getByRole('button', { name: 'Visit', exact: true }).click()

  await expect(page.locator('#status')).toHaveText('pending')
  await expect(page.locator('#status')).toHaveText('timed-out', { timeout: 5000 })
  await expect(page.locator('#cancel-fired')).toHaveText('yes')
  await expect(page.locator('#timeout-fired')).toHaveText('yes')
})

test('it accepts a string-unit timeout value', async ({ page }) => {
  test.setTimeout(10000)

  await page.goto('/visit/timeout')

  await page.getByRole('button', { name: 'Visit (string)' }).click()

  await expect(page.locator('#status')).toHaveText('timed-out', { timeout: 5000 })
  await expect(page.locator('#timeout-fired')).toHaveText('yes')
})

test('it removes the progress bar after a timeout', async ({ page }) => {
  test.setTimeout(10000)

  await page.goto('/visit/timeout')

  await page.getByRole('button', { name: 'Visit', exact: true }).click()

  await expect(page.locator('#nprogress')).toHaveCount(1, { timeout: 1000 })
  await expect(page.locator('#status')).toHaveText('timed-out', { timeout: 5000 })

  await expect(page.locator('#nprogress')).toHaveCount(0, { timeout: 2000 })
})

test('prefetch ignores app-level visitOptions timeout', async ({ page }) => {
  test.setTimeout(10000)

  await page.goto('/?withTimeoutDefault')

  requests.listen(page)
  requests.listenForFailed(page)
  requests.listenForFinished(page)

  await page.evaluate(() => {
    ;(window as any).testing.Inertia.prefetch('/visit/timeout/slow?delay=600', {}, { cacheFor: 30000 })
  })

  await page.waitForTimeout(1500)

  const slowRequests = requests.requests.filter((r) => r.url().includes('/visit/timeout/slow'))
  const slowFailed = requests.failed.filter((r) => r.url().includes('/visit/timeout/slow'))
  const slowFinished = requests.finished.filter((r) => r.url().includes('/visit/timeout/slow'))

  await expect(slowRequests.length).toBeGreaterThanOrEqual(1)
  await expect(slowFailed.length).toBe(0)
  await expect(slowFinished.length).toBeGreaterThanOrEqual(1)
})

test('prefetch cache key ignores onTimeout callback identity', async ({ page }) => {
  test.setTimeout(10000)

  await page.goto('/')

  requests.listen(page)
  requests.listenForFinished(page)

  await page.evaluate(() => {
    ;(window as any).testing.Inertia.prefetch(
      '/visit/timeout/slow?delay=100',
      { onTimeout: () => 1 },
      { cacheFor: 30000 },
    )
  })

  await page.waitForTimeout(500)

  await page.evaluate(() => {
    ;(window as any).testing.Inertia.prefetch(
      '/visit/timeout/slow?delay=100',
      { onTimeout: () => 2 },
      { cacheFor: 30000 },
    )
  })

  await page.waitForTimeout(500)

  const slowRequests = requests.requests.filter((r) => r.url().includes('/visit/timeout/slow'))
  await expect(slowRequests.length).toBe(1)
})
