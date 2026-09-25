import { expect, Page, test } from '@playwright/test'
import { consoleMessages, pageLoads, requests } from './support'

const getLog = (page: Page): Promise<string[]> => {
  return page.evaluate(() => window._http_cancellation_log || [])
}

const sentRequests = (query: string) => {
  return requests.requests.filter((request) => request.url().includes(query))
}

test.describe('HTTP cancellation', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/http-cancellation')
    requests.listen(page)
    consoleMessages.listen(page)
  })

  test('it rejects an already-aborted signal without sending a request', async ({ page }) => {
    await page.getByRole('button', { name: 'Request With Aborted Signal' }).click()

    await expect(page.locator('#log')).toHaveText('error:HttpCancelledError,outcome:HttpCancelledError')
    expect(sentRequests('request=aborted')).toEqual([])
  })

  test('it rejects cancellation during asynchronous request preparation', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel During Preparation' }).click()

    await expect(page.locator('#log')).toHaveText('outcome:HttpCancelledError')
    expect(sentRequests('request=preparing')).toEqual([])
  })

  test('it still aborts a request after it has started', async ({ page }) => {
    let requestStarted!: () => void
    const started = new Promise<void>((resolve) => (requestStarted = resolve))

    await page.route('**/dump/get?request=started', () => requestStarted())

    await page.getByRole('button', { name: 'Start Long Request' }).click()
    await started
    await page.getByRole('button', { name: 'Cancel Started Request' }).click()

    await expect(page.locator('#log')).toHaveText('outcome:HttpCancelledError')
  })

  test('it does not apply a visit cancelled before its XHR is created', async ({ page }) => {
    await page.getByRole('button', { name: 'Visit Cancelled Before Send' }).click()

    await expect(page).toHaveURL('/dump/get?request=current')
    expect(await getLog(page)).toEqual(['old:cancel', 'old:finish', 'current:success'])
    expect(sentRequests('request=old')).toEqual([])
    expect(consoleMessages.errors).toEqual([])
  })

  test('it does not send a prefetch cancelled before its XHR is created', async ({ page }) => {
    await page.getByRole('button', { name: 'Prefetch Cancelled Before Send' }).click()

    await expect(page.locator('#log')).toHaveText('prefetch:HttpCancelledError')
    expect(sentRequests('request=prefetch')).toEqual([])
  })
})
