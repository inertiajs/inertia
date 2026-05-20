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

const setHidden = (page, hidden: boolean) =>
  page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (hidden ? 'hidden' : 'visible'),
    })
    document.dispatchEvent(new Event('visibilitychange'))
  }, hidden)
;['overlap', 'rest'].forEach((mode) => {
  test(`it throttles polling when in the background and resumes when visible (${mode})`, async ({ page }) => {
    await page.goto(`/poll/overlap/${mode}?interval=200&delay=10`)

    await page.waitForResponse(page.url())

    await setHidden(page, true)

    requests.listen(page)
    await page.waitForTimeout(1400)

    const hiddenCount = pollRequests().length
    await expect(hiddenCount).toBeGreaterThanOrEqual(1)
    await expect(hiddenCount).toBeLessThanOrEqual(2)

    await setHidden(page, false)

    await page.waitForTimeout(1000)

    const visibleCount = pollRequests().length - hiddenCount
    await expect(visibleCount).toBeGreaterThanOrEqual(3)
  })
})

test('it keeps the throttled cadence when staying in the background past one cycle', async ({ page }) => {
  await page.goto('/poll/overlap/rest?interval=100&delay=10')

  await page.waitForResponse(page.url())

  await setHidden(page, true)

  requests.listen(page)
  // Two full 10x cycles (~2s) — expect ~2 fires (first tick, then 10th).
  await page.waitForTimeout(2200)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(2)
  await expect(pollRequests().length).toBeLessThanOrEqual(3)
})

test('it does not throttle when keepAlive is set, even when hidden', async ({ page }) => {
  await page.goto('/poll/overlap/overlap?interval=200&delay=10&keepAlive=1')

  await page.waitForResponse(page.url())

  await setHidden(page, true)

  requests.listen(page)
  await page.waitForTimeout(1400)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(4)
})

test('it does not double-schedule when stopped and restarted mid-flight (rest)', async ({ page }) => {
  await page.goto('/poll/overlap/rest?interval=200&delay=800')

  await page.waitForRequest(page.url())

  // First request is now in flight (won't finish for ~800ms).
  // Stop+start immediately so the stale onFinish would, without the session guard,
  // call scheduleNext and create a second concurrent chain.
  await page.getByRole('button', { name: 'Stop' }).click()
  await page.getByRole('button', { name: 'Start' }).click()

  requests.listen(page)

  // Two full cycles of the restarted chain (~2 requests). A double chain would yield ~4.
  await page.waitForTimeout(2400)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(1)
  await expect(pollRequests().length).toBeLessThanOrEqual(3)
})

test('it does not cancel skipped throttled ticks in cancel mode', async ({ page }) => {
  await page.goto('/poll/overlap/cancel?interval=200&delay=10')

  await page.waitForResponse(page.url())

  await setHidden(page, true)

  requests.listen(page)
  requests.listenForFailed(page)
  await page.waitForTimeout(1400)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(1)
  await expect(pollRequests().length).toBeLessThanOrEqual(2)
  await expect(pollFailed().length).toBe(0)
})

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

test('it re-evaluates poll request options on each tick when passed as a function', async ({ page }) => {
  const url = '/poll/dynamic-data'

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

test('it cleans up the poll on unmount and does not leak across rerenders', async ({ page }) => {
  await page.goto('/poll/dynamic-data')
  await expect(page.locator('#counter')).toHaveText('counter: 0')

  await page.waitForResponse(
    (response) =>
      response.url().includes('/poll/dynamic-data') && new URL(response.url()).searchParams.get('counter_seen') === '0',
  )

  const pollsAfterMount = await page.evaluate(() => window.testing.Inertia.activePolls)
  await expect(pollsAfterMount).toBe(1)

  for (let i = 1; i <= 5; i++) {
    await page.getByRole('button', { name: 'Increment' }).click()
    await expect(page.locator('#counter')).toHaveText(`counter: ${i}`)
  }

  const pollsAfterRerenders = await page.evaluate(() => window.testing.Inertia.activePolls)
  await expect(pollsAfterRerenders).toBe(1)

  await page.getByRole('link', { name: 'Home' }).click()
  await page.waitForURL('/')

  requests.listen(page)
  await page.waitForTimeout(1000)

  const leftover = requests.requests.filter((r) => r.url().includes('/poll/dynamic-data'))
  await expect(leftover).toHaveLength(0)

  const pollsAfterUnmount = await page.evaluate(() => window.testing.Inertia.activePolls)
  await expect(pollsAfterUnmount).toBe(0)
})

const pollRequests = () => requests.requests.filter((r) => r.url().includes('/poll/overlap/'))
const pollFinished = () => requests.finished.filter((r) => r.url().includes('/poll/overlap/'))
const pollFailed = () => requests.failed.filter((r) => r.url().includes('/poll/overlap/'))

test('it allows overlapping requests by default', async ({ page }) => {
  await page.goto('/poll/overlap/none?interval=200&delay=600')

  requests.listen(page)
  requests.listenForFinished(page)

  await page.waitForTimeout(2000)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(3)
  await expect(pollFinished().length).toBeLessThan(pollRequests().length)
})

test('it allows overlapping requests with explicit mode: overlap', async ({ page }) => {
  await page.goto('/poll/overlap/overlap?interval=200&delay=600')

  requests.listen(page)
  requests.listenForFinished(page)

  await page.waitForTimeout(2000)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(3)
  await expect(pollFinished().length).toBeLessThan(pollRequests().length)
})

test('it waits for the interval between requests with mode: rest', async ({ page }) => {
  await page.goto('/poll/overlap/rest?interval=200&delay=400')

  requests.listen(page)
  requests.listenForFinished(page)
  requests.listenForFailed(page)

  await page.waitForTimeout(2000)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(2)
  await expect(pollFinished().length).toBe(pollRequests().length)
  await expect(pollFailed().length).toBe(0)
})

test('it cancels in-flight requests on each tick with mode: cancel', async ({ page }) => {
  await page.goto('/poll/overlap/cancel?interval=200&delay=600')

  requests.listen(page)
  requests.listenForFailed(page)

  await page.waitForTimeout(2000)

  await expect(pollRequests().length).toBeGreaterThanOrEqual(3)
  await expect(pollFailed().length).toBeGreaterThanOrEqual(pollRequests().length - 1)
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
