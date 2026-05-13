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

  // Wait for console messages to be captured (may be delayed in Firefox)
  await expect.poll(() => consoleMessages.messages.length, { timeout: 2000 }).toBeGreaterThanOrEqual(2)
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

Object.entries({
  unencrypted: '/poll/unchanged-data',
  encrypted: '/poll/unchanged-data/encrypted',
}).forEach(([scenario, url]) => {
  test(`it skips replaceState when polling returns unchanged data (${scenario})`, async ({ page }) => {
    await page.goto(url)

    await page.waitForResponse(page.url())
    await page.waitForResponse(page.url())

    const pollsFinished = Number(await page.locator('.pollsFinished').textContent())
    await expect(pollsFinished).toBeGreaterThanOrEqual(2)

    // Only 1 replaceState from initial page load, none from polling
    await expect(page.locator('.replaceStateCalls')).toHaveText('1')
  })
})

const dynamicDataScenarios = [
  { name: 'requestOptions is a function', url: '/poll/dynamic-data' },
  { name: 'data option is a function', url: '/poll/dynamic-data-inner' },
]

dynamicDataScenarios.forEach(({ name, url }) => {
  test(`it re-evaluates poll data on each tick when ${name}`, async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('#counter')).toHaveText('counter: 0')

    await page.waitForResponse(
      (response) => response.url().includes(url) && new URL(response.url()).searchParams.get('counter_seen') === '0',
    )
    await expect(page.locator('#last_received')).toHaveText('received: 0')

    await page.getByRole('button', { name: 'Increment' }).click()
    await expect(page.locator('#counter')).toHaveText('counter: 1')

    await page.waitForResponse(
      (response) => response.url().includes(url) && new URL(response.url()).searchParams.get('counter_seen') === '1',
    )
    await expect(page.locator('#last_received')).toHaveText('received: 1')

    await page.getByRole('button', { name: 'Increment' }).click()
    await expect(page.locator('#counter')).toHaveText('counter: 2')

    await page.waitForResponse(
      (response) => response.url().includes(url) && new URL(response.url()).searchParams.get('counter_seen') === '2',
    )
    await expect(page.locator('#last_received')).toHaveText('received: 2')
  })
})

test('it preserves validation errors when poll reloads data', async ({ page }) => {
  await page.goto('/poll/preserve-errors')

  await expect(page.locator('#page-error')).not.toBeVisible()
  await expect(page.locator('#form-error')).not.toBeVisible()

  // Submit form to trigger validation error
  const errorResponsePromise = page.waitForResponse(
    (response) => !response.request().headers()['x-inertia-partial-data'] && response.status() === 200,
  )
  await page.getByRole('button', { name: 'Submit' }).click()
  await errorResponsePromise

  await expect(page.locator('#page-error')).toBeVisible()
  await expect(page.locator('#page-error')).toHaveText('The name field is required.')
  await expect(page.locator('#form-error')).toBeVisible()
  await expect(page.locator('#form-error')).toHaveText('The name field is required.')

  // Wait for a poll response (partial reload)
  await page.waitForResponse(
    (response) => response.request().headers()['x-inertia-partial-data'] === 'time' && response.status() === 200,
  )

  await expect(page.locator('#page-error')).toBeVisible()
  await expect(page.locator('#page-error')).toHaveText('The name field is required.')
  await expect(page.locator('#form-error')).toBeVisible()
  await expect(page.locator('#form-error')).toHaveText('The name field is required.')
})
