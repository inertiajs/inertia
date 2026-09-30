import { expect, Page, test } from '@playwright/test'
import { pageLoads, requests } from './support'

const ORDER_EVENT = 'App\\Events\\OrderUpdated'
const FEED_EVENT = 'App\\Events\\FeedUpdated'
const FEED_CLEARED_EVENT = 'App\\Events\\FeedCleared'
const BALANCE_EVENT = 'App\\Events\\BalanceUpdated'
const THROTTLED_EVENT = 'App\\Events\\ThrottledUpdated'
const NOTES_EVENT = 'App\\Events\\NotesUpdated'
const ORDER_ARCHIVED_EVENT = 'App\\Events\\OrderArchived'
const USER_EVENT = 'App\\Events\\UserUpdated'

const emit = (page: Page, channel: string, event: string, payload: unknown = null) => {
  return page.evaluate(({ channel, event, payload }) => window.__inertiaLive.emit(channel, event, payload), {
    channel,
    event,
    payload,
  })
}

const liveRequests = () => requests.requests.filter((request) => request.url().includes('/live')).length

const setHidden = (page: Page, hidden: boolean) =>
  page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (hidden ? 'hidden' : 'visible'),
    })
    document.dispatchEvent(new Event('visibilitychange'))
  }, hidden)

test.describe('Live props', () => {
  test('it subscribes to the live props the server sent and reloads the ones an event feeds', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')

    await expect(page.locator('#subscription-count')).toHaveText('8')
    await expect(page.locator('#subscriptions')).toContainText(`private:orders.1::${ORDER_EVENT}`)
    await expect(page.locator('#subscriptions')).toContainText(`public:feed::${FEED_EVENT}`)
    await expect(page.locator('#socket-id-header')).toHaveText('none')

    const order = await page.locator('#order').textContent()
    const stats = await page.locator('#stats').textContent()
    const plain = await page.locator('#plain').textContent()

    const response = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT, { id: 1 })

    await expect(page.locator('#events')).toHaveText('1')
    await expect(page.locator('#last-channel')).toHaveText('private:orders.1')
    await expect(page.locator('#last-event')).toHaveText(ORDER_EVENT)
    await expect(page.locator('#last-props')).toHaveText('order, stats')
    await expect(page.locator('#last-payload')).toHaveText('{"id":1}')

    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#stats')).not.toHaveText(stats!)
    await expect(page.locator('#plain')).toHaveText(plain!)
    await expect(page.locator('#socket-id-header')).toHaveText('fake-socket-id')
  })

  test('it preserves the event and channel pairing the server sent', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')

    const expectedSubscriptions = [`private:orders.1::${ORDER_ARCHIVED_EVENT}`, `private:users.7::${USER_EVENT}`]
    const bogusSubscriptions = [`private:orders.1::${USER_EVENT}`, `private:users.7::${ORDER_ARCHIVED_EVENT}`]
    const subscriptions = await page.evaluate(() => window.__inertiaLive.subscriptions())
    const multiSubscriptions = subscriptions.filter(
      (subscription) => subscription.includes(ORDER_ARCHIVED_EVENT) || subscription.includes(USER_EVENT),
    )

    expect(multiSubscriptions.sort()).toEqual(expectedSubscriptions)
    expect(subscriptions.filter((subscription) => bogusSubscriptions.includes(subscription))).toEqual([])

    requests.listen(page)

    const multi = await page.locator('#multi').textContent()

    await emit(page, 'orders.1', USER_EVENT)
    await emit(page, 'users.7', ORDER_ARCHIVED_EVENT)
    await page.waitForTimeout(300)

    expect(liveRequests()).toBe(0)
    await expect(page.locator('#multi')).toHaveText(multi!)

    const orderResponse = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_ARCHIVED_EVENT)
    await orderResponse

    await expect(page.locator('#multi')).not.toHaveText(multi!)

    const updated = await page.locator('#multi').textContent()

    const userResponse = page.waitForResponse('**/live')
    await emit(page, 'users.7', USER_EVENT)
    await userResponse

    await expect(page.locator('#multi')).not.toHaveText(updated!)
  })

  test('it batches events that arrive milliseconds apart into a single reload', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const order = await page.locator('#order').textContent()
    const notes = await page.locator('#notes').textContent()

    const response = page.waitForResponse('**/live')

    // Two events on one channel, the way a server action that broadcasts twice
    // reaches the client: separate frames a few milliseconds apart
    await page.evaluate(
      async ({ orderEvent, notesEvent }) => {
        window.__inertiaLive.emit('orders.1', orderEvent)
        await new Promise((resolve) => setTimeout(resolve, 5))
        window.__inertiaLive.emit('orders.1', notesEvent)
      },
      { orderEvent: ORDER_EVENT, notesEvent: NOTES_EVENT },
    )

    await expect(page.locator('#events')).toHaveText('2')

    await response
    await page.waitForTimeout(300)

    const partials = await Promise.all(
      requests.requests
        .filter((request) => request.url().includes('/live'))
        .map(async (request) => (await request.allHeaders())['x-inertia-partial-data']),
    )

    expect(partials).toHaveLength(1)
    expect(partials[0].split(',').sort()).toEqual(['notes', 'order', 'stats'])

    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#notes')).not.toHaveText(notes!)
  })

  test('it throttles reloads', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const leading = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT)
    await leading
    expect(liveRequests()).toBe(1)

    const trailing = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT)
    await emit(page, 'orders.1', ORDER_EVENT)
    await expect(page.locator('#events')).toHaveText('3')

    await page.waitForTimeout(300)
    expect(liveRequests()).toBe(1)

    await trailing
    expect(liveRequests()).toBe(2)
  })

  test('it honors a throttle the server sets on one prop', async ({ page }) => {
    test.setTimeout(15_000)

    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const leading = page.waitForResponse('**/live')
    await emit(page, 'throttled', THROTTLED_EVENT)
    await leading
    expect(liveRequests()).toBe(1)

    const throttled = await page.locator('#throttled').textContent()

    // The server gives this prop a 5s throttle, so the second event keeps waiting
    await emit(page, 'throttled', THROTTLED_EVENT)
    await page.waitForTimeout(1500)
    expect(liveRequests()).toBe(1)

    // A prop on the default throttle owes nothing, so it must not wait out the
    // neighbour's remaining ~3.5s. The tight timeout is the whole assertion.
    const trailing = page.waitForResponse('**/live', { timeout: 1500 })
    await emit(page, 'orders.1', ORDER_EVENT)
    const resolved = await trailing

    expect(resolved.request().headers()['x-inertia-partial-data']).toBe('order,stats')
    expect(liveRequests()).toBe(2)

    // And the throttled prop is still waiting, not swept along with it
    await expect(page.locator('#throttled')).toHaveText(throttled!)
  })

  test('it honors the throttle set on the app, and lets a prop override it', async ({ page }) => {
    test.setTimeout(15_000)

    pageLoads.watch(page)
    await page.goto('/live?liveThrottle=2000')
    requests.listen(page)

    const leading = page.waitForResponse('**/live**')
    await emit(page, 'orders.1', ORDER_EVENT)
    await leading
    expect(liveRequests()).toBe(1)

    // The app default is 2s, so the default 1s window is not what is in play
    await emit(page, 'orders.1', ORDER_EVENT)
    await page.waitForTimeout(1300)
    expect(liveRequests()).toBe(1)

    const trailing = page.waitForResponse('**/live**')
    await trailing
    expect(liveRequests()).toBe(2)

    // The server's own throttle still wins over the app default
    const throttledLeading = page.waitForResponse('**/live**')
    await emit(page, 'throttled', THROTTLED_EVENT)
    await throttledLeading

    await emit(page, 'throttled', THROTTLED_EVENT)
    await page.waitForTimeout(2500)
    expect(liveRequests()).toBe(3)
  })

  test('it lets a listener cancel the reload', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    await page.getByRole('button', { name: 'Toggle Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Toggle Cancel' })).toHaveText('Toggle Cancel: true')

    const order = await page.locator('#order').textContent()

    await emit(page, 'orders.1', ORDER_EVENT)
    await expect(page.locator('#events')).toHaveText('1')

    await page.waitForTimeout(300)
    expect(liveRequests()).toBe(0)
    await expect(page.locator('#order')).toHaveText(order!)

    await page.getByRole('button', { name: 'Toggle Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Toggle Cancel' })).toHaveText('Toggle Cancel: false')

    const response = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT)
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it refreshes a prop from either event a single listener carries', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')

    await expect(page.locator('#subscriptions')).toContainText(`public:feed::${FEED_EVENT}`)
    await expect(page.locator('#subscriptions')).toContainText(`public:feed::${FEED_CLEARED_EVENT}`)

    const feed = await page.locator('#feed').textContent()

    const updated = page.waitForResponse('**/live')
    await emit(page, 'feed', FEED_EVENT)
    await updated

    const afterUpdate = await page.locator('#feed').textContent()
    expect(afterUpdate).not.toBe(feed)

    const cleared = page.waitForResponse('**/live')
    await emit(page, 'feed', FEED_CLEARED_EVENT)
    await cleared

    await expect(page.locator('#feed')).not.toHaveText(afterUpdate!)
  })

  test('it refreshes a nested prop by its dot path', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    await expect(page.locator('#subscriptions')).toContainText(`private:accounts.1::${BALANCE_EVENT}`)

    const balance = await page.locator('#account-balance').textContent()
    const order = await page.locator('#order').textContent()

    const response = page.waitForResponse('**/live')
    await emit(page, 'accounts.1', BALANCE_EVENT)
    const resolved = await response

    expect(resolved.request().headers()['x-inertia-partial-data']).toBe('account.balance')

    await expect(page.locator('#account-balance')).not.toHaveText(balance!)
    await expect(page.locator('#order')).toHaveText(order!)
  })

  test('it holds events while the tab is hidden and flushes them when it comes back', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    await setHidden(page, true)

    const order = await page.locator('#order').textContent()

    await emit(page, 'orders.1', ORDER_EVENT)
    await page.waitForTimeout(300)
    expect(liveRequests()).toBe(0)

    const response = page.waitForResponse('**/live')
    await setHidden(page, false)
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it keeps refreshing a hidden tab when pauseWhenHidden is off', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live?liveKeepAlive=1')
    requests.listen(page)

    await setHidden(page, true)

    const order = await page.locator('#order').textContent()

    const response = page.waitForResponse('**/live**', { timeout: 2000 })
    await emit(page, 'orders.1', ORDER_EVENT)
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it keeps the subscriptions of props a partial reload did not refresh', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')

    const plainResponse = page.waitForResponse('**/live')
    await page.getByRole('button', { name: 'Reload Plain' }).click()
    await plainResponse

    await page.getByRole('button', { name: 'Show Subscriptions' }).click()
    await expect(page.locator('#subscription-count')).toHaveText('8')

    const feed = await page.locator('#feed').textContent()

    const feedResponse = page.waitForResponse('**/live')
    await emit(page, 'feed', FEED_EVENT)
    await feedResponse

    await expect(page.locator('#feed')).not.toHaveText(feed!)
  })

  test('it drops subscriptions when navigating away and restores them going back', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')

    await expect(page.locator('#subscription-count')).toHaveText('8')

    await page.getByRole('link', { name: 'Leave' }).click()
    await expect(page.locator('h1')).toHaveText('Socket Id')

    expect(await page.evaluate(() => window.__inertiaLive.subscriptions())).toEqual([])

    await page.goBack()
    await expect(page.locator('h1')).toHaveText('Live Props')

    await page.getByRole('button', { name: 'Show Subscriptions' }).click()
    await expect(page.locator('#subscription-count')).toHaveText('8')

    const order = await page.locator('#order').textContent()

    const response = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT)
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it reloads every live prop after the transport reconnects', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')

    const order = await page.locator('#order').textContent()
    const feed = await page.locator('#feed').textContent()

    await page.evaluate(() => window.__inertiaLive.status(true))
    await page.evaluate(() => window.__inertiaLive.status(false))

    const response = page.waitForResponse('**/live')
    await page.evaluate(() => window.__inertiaLive.status(true))
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#feed')).not.toHaveText(feed!)

    // A transport may repeat a status it is already in, which is not a reconnect
    requests.listen(page)
    await page.evaluate(() => window.__inertiaLive.status(true))
    await page.waitForTimeout(300)

    expect(liveRequests()).toBe(0)
  })

  test('it writes the values a broadcast carried instead of reloading the props', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const plain = await page.locator('#plain').textContent()

    await emit(page, 'orders.1', ORDER_EVENT, {
      __inertia: { props: { order: 'order-from-payload', stats: 'stats-from-payload' } },
    })

    await expect(page.locator('#order')).toHaveText('order-from-payload')
    await expect(page.locator('#stats')).toHaveText('stats-from-payload')

    await expect(page.locator('#events')).toHaveText('1')
    await expect(page.locator('#last-payload')).toHaveText(
      '{"__inertia":{"props":{"order":"order-from-payload","stats":"stats-from-payload"}}}',
    )

    await page.waitForTimeout(300)

    expect(liveRequests()).toBe(0)
    await expect(page.locator('#plain')).toHaveText(plain!)
  })

  test('it reloads the props of the subscription the payload left out', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const stats = await page.locator('#stats').textContent()

    const response = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT, { __inertia: { props: { order: 'order-from-payload' } } })

    await expect(page.locator('#order')).toHaveText('order-from-payload')

    const resolved = await response

    expect(resolved.request().headers()['x-inertia-partial-data']).toBe('stats')

    await expect(page.locator('#stats')).not.toHaveText(stats!)
    await expect(page.locator('#order')).toHaveText('order-from-payload')

    expect(liveRequests()).toBe(1)
  })

  test('it writes a nested value by its dot path without touching its siblings', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const currency = await page.locator('#account-currency').textContent()
    const order = await page.locator('#order').textContent()

    await emit(page, 'accounts.1', BALANCE_EVENT, {
      __inertia: { props: { 'account.balance': 'balance-from-payload' } },
    })

    await expect(page.locator('#account-balance')).toHaveText('balance-from-payload')

    await page.waitForTimeout(300)

    expect(liveRequests()).toBe(0)
    await expect(page.locator('#account-currency')).toHaveText(currency!)
    await expect(page.locator('#order')).toHaveText(order!)
  })

  test('it reloads when an event carries prop values outside the envelope', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const order = await page.locator('#order').textContent()

    const response = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT, { order: 'order-from-payload', stats: 'stats-from-payload' })
    const resolved = await response

    expect(resolved.request().headers()['x-inertia-partial-data']).toBe('order,stats')

    await expect(page.locator('#order')).not.toHaveText('order-from-payload')
    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#stats')).not.toHaveText('stats-from-payload')
  })

  test('it ignores a payload key the subscription that delivered it does not feed', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const notes = await page.locator('#notes').textContent()
    const plain = await page.locator('#plain').textContent()
    const stats = await page.locator('#stats').textContent()

    const response = page.waitForResponse('**/live')
    await emit(page, 'orders.1', ORDER_EVENT, {
      __inertia: {
        props: {
          order: 'order-from-payload',
          notes: 'notes-from-payload',
          plain: 'plain-from-payload',
        },
      },
    })

    await expect(page.locator('#order')).toHaveText('order-from-payload')

    const resolved = await response

    expect(resolved.request().headers()['x-inertia-partial-data']).toBe('stats')

    await expect(page.locator('#stats')).not.toHaveText(stats!)
    await expect(page.locator('#notes')).toHaveText(notes!)
    await expect(page.locator('#plain')).toHaveText(plain!)

    expect(liveRequests()).toBe(1)
  })

  test('it discards a value for a prop a request already claims and reloads it instead', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live?delay=1000')
    requests.listen(page)

    const order = await page.locator('#order').textContent()

    const started = page.waitForRequest('**/live**')
    const inFlight = page.waitForResponse('**/live**')

    await emit(page, 'orders.1', ORDER_EVENT)

    // The payload has to arrive while the reload is still out, which is the
    // only state in which the reload gets to win
    await started
    await emit(page, 'orders.1', ORDER_EVENT, { __inertia: { props: { order: 'order-from-payload' } } })

    await expect(page.locator('#events')).toHaveText('2')
    await expect(page.locator('#order')).toHaveText(order!)

    await inFlight

    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#order')).not.toHaveText('order-from-payload')

    const reloaded = await page.locator('#order').textContent()

    const resolved = await page.waitForResponse('**/live**')

    expect(resolved.request().headers()['x-inertia-partial-data']).toBe('order,stats')

    await expect(page.locator('#order')).not.toHaveText(reloaded!)
    await expect(page.locator('#order')).not.toHaveText('order-from-payload')
  })

  test('it does not reload live props when the transport connects for the first time', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/live')
    requests.listen(page)

    const order = await page.locator('#order').textContent()
    const feed = await page.locator('#feed').textContent()

    await page.evaluate(() => window.__inertiaLive.status(false))
    await page.evaluate(() => window.__inertiaLive.status(true))
    await page.waitForTimeout(300)

    expect(liveRequests()).toBe(0)
    await expect(page.locator('#order')).toHaveText(order!)
    await expect(page.locator('#feed')).toHaveText(feed!)
  })
})
