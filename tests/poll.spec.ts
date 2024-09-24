import { expect, test } from '@playwright/test'
import { consoleMessages, requests } from './support'

test('will start polling when the component mounts with usePoll', async ({ page }) => {
  await page.goto('/poll/hook')

  consoleMessages.listen(page)

  const start = Date.now()

  const response = await page.waitForResponse(page.url())
  const firstRequestTime = Date.now() - start
  await expect(firstRequestTime).toBeGreaterThanOrEqual(400)
  await expect(firstRequestTime).toBeLessThanOrEqual(700)

  const response2 = await page.waitForResponse(page.url())
  const secondRequestTime = Date.now() - start - firstRequestTime
  await expect(secondRequestTime).toBeGreaterThanOrEqual(400)
  await expect(secondRequestTime).toBeLessThanOrEqual(700)

  const only = await response.request().headerValue('X-Inertia-Partial-Data')
  await expect(only).toBe('custom_prop')

  const only2 = await response2.request().headerValue('X-Inertia-Partial-Data')
  await expect(only2).toBe('custom_prop')

  await expect(consoleMessages.messages[0]).toContain('hook poll finished')
  await expect(consoleMessages.messages[1]).toContain('hook poll finished')

  await page.getByRole('link', { name: 'Home' }).click()
  await page.waitForURL('/')

  requests.listen(page)

  await page.waitForTimeout(700)

  await expect(requests.requests).toHaveLength(0)
})

const manualData = [
  { method: 'hook', url: '/poll/hook/manual' },
  { method: 'router.poll', url: '/poll/router/manual' },
]

manualData.forEach(({ method, url }) => {
  test(`you can manually start and stop (${method})`, async ({ page }) => {
    consoleMessages.listen(page)

    await page.goto(url)

    requests.listen(page)
    await page.waitForTimeout(700)
    await expect(requests.requests).toHaveLength(0)

    await page.getByRole('button', { name: 'Start' }).click()

    const start = Date.now()

    const response = await page.waitForResponse(page.url())
    const firstRequestTime = Date.now() - start
    await expect(firstRequestTime).toBeGreaterThanOrEqual(400)
    await expect(firstRequestTime).toBeLessThanOrEqual(700)

    const response2 = await page.waitForResponse(page.url())
    const secondRequestTime = Date.now() - start - firstRequestTime
    await expect(secondRequestTime).toBeGreaterThanOrEqual(400)
    await expect(secondRequestTime).toBeLessThanOrEqual(700)

    await page.getByRole('button', { name: 'Stop' }).click()

    const only = await response.request().headerValue('X-Inertia-Partial-Data')
    await expect(only).toBe('custom_prop')

    const only2 = await response2.request().headerValue('X-Inertia-Partial-Data')
    await expect(only2).toBe('custom_prop')

    await expect(consoleMessages.messages[0]).toContain('hook poll finished')
    await expect(consoleMessages.messages[1]).toContain('hook poll finished')

    requests.listen(page)

    await page.waitForTimeout(700)
    await expect(requests.requests).toHaveLength(0)
  })
})

test.skip('it will throttle polling when in the background', async ({ page }) => {})
test.skip('it is able to keep alive when in the background', async ({ page }) => {})
