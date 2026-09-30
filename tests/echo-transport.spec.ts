import { expect, Page, test } from '@playwright/test'
import { pageLoads } from './support'

const ORDER_EVENT = 'App\\Events\\OrderUpdated'
const STATS_EVENT = 'App\\Events\\StatsUpdated'

const emit = (page: Page, channel: string, event: string, payload: unknown = null) => {
  return page.evaluate(({ channel, event, payload }) => window.__inertiaEcho.emit(channel, event, payload), {
    channel,
    event,
    payload,
  })
}

const echoLog = (page: Page) => page.evaluate(() => window.__inertiaEcho.log())

test.describe('Echo transport', () => {
  test('it maps every channel type to the matching Echo call with an unprefixed name', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    const log = await echoLog(page)

    expect(log).toContain('join private-orders.1')
    expect(log).toContain('join presence-rooms.1')
    expect(log).toContain('join private-encrypted-secrets.1')
    expect(log).toContain('join news')

    // Two props share the private channel through different events
    expect(log.filter((entry) => entry === 'join private-orders.1')).toHaveLength(1)
  })

  test('it formats event names so the app namespace never touches them', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    const log = await echoLog(page)

    expect(log).toContain(`listen private-orders.1 ${ORDER_EVENT}`)
    expect(log).toContain(`listen private-orders.1 ${STATS_EVENT}`)
    expect(log).toContain('listen news news.published')
  })

  test('it reloads the prop an Echo event feeds and sends the socket id along', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    await expect(page.locator('#socket-id-header')).toHaveText('none')

    const order = await page.locator('#order').textContent()
    const stats = await page.locator('#stats').textContent()

    const response = page.waitForResponse('**/echo-transport**')
    await emit(page, 'private-orders.1', ORDER_EVENT, { id: 1 })
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#stats')).toHaveText(stats!)
    await expect(page.locator('#socket-id-header')).toHaveText('echo-socket-id')

    const roomResponse = page.waitForResponse('**/echo-transport**')
    await emit(page, 'presence-rooms.1', 'App\\Events\\RoomUpdated')
    await roomResponse

    const newsResponse = page.waitForResponse('**/echo-transport**')
    await emit(page, 'news', 'news.published')
    await newsResponse
  })

  test('it stops listening without leaving a channel another live prop still needs', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    const dropped = page.waitForResponse('**/echo-transport**')
    await page.getByRole('button', { name: 'Drop Stats' }).click()
    await dropped

    await page.getByRole('button', { name: 'Show Log' }).click()

    const log = await echoLog(page)

    expect(log).toContain(`stopListening private-orders.1 ${STATS_EVENT}`)
    expect(log).not.toContain('leave private-orders.1')

    const order = await page.locator('#order').textContent()

    const response = page.waitForResponse('**/echo-transport**')
    await emit(page, 'private-orders.1', ORDER_EVENT)
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it keeps a channel joined when only the events on it change', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    const swapped = page.waitForResponse('**/echo-transport**')
    await page.getByRole('button', { name: 'Swap Events' }).click()
    await swapped

    await page.getByRole('button', { name: 'Show Log' }).click()

    const log = await echoLog(page)

    // Both props keep listening on orders.1, so the channel is never released,
    // even though every event key on it was replaced
    expect(log).toContain('listen private-orders.1 App\\Events\\OrderArchived')
    expect(log).not.toContain('leave private-orders.1')

    const order = await page.locator('#order').textContent()

    const response = page.waitForResponse('**/echo-transport**')
    await emit(page, 'private-orders.1', 'App\\Events\\OrderArchived')
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it watches the connection of the Echo instance configureEcho handed out last', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    // Reconfiguring Echo builds a new instance with a new connector. The status
    // watch has to follow it, or every later reconnect goes unnoticed.
    await page.evaluate(() => window.__inertiaEcho.swap())

    const swapped = page.waitForResponse('**/echo-transport**')
    await page.getByRole('button', { name: 'Swap Events' }).click()
    await swapped

    const order = await page.locator('#order').textContent()

    await page.evaluate(() => window.__inertiaEcho.status('connected'))
    await page.evaluate(() => window.__inertiaEcho.status('disconnected'))

    const response = page.waitForResponse('**/echo-transport**', { timeout: 2000 })
    await page.evaluate(() => window.__inertiaEcho.status('connected'))
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
  })

  test('it reloads the live props when the Echo connection comes back', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    const order = await page.locator('#order').textContent()
    const news = await page.locator('#news').textContent()

    await page.evaluate(() => window.__inertiaEcho.status('connected'))
    await page.evaluate(() => window.__inertiaEcho.status('disconnected'))

    const response = page.waitForResponse('**/echo-transport**')
    await page.evaluate(() => window.__inertiaEcho.status('connected'))
    await response

    await expect(page.locator('#order')).not.toHaveText(order!)
    await expect(page.locator('#news')).not.toHaveText(news!)
  })

  test('it stops listening and leaves every channel when the live props go away', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/echo-transport')

    await page.getByRole('link', { name: 'Leave' }).click()
    await expect(page.locator('h1')).toHaveText('Socket Id')

    const log = await echoLog(page)

    expect(log).toContain(`stopListening private-orders.1 ${ORDER_EVENT}`)
    expect(log).toContain(`stopListening private-orders.1 ${STATS_EVENT}`)
    expect(log).toContain('leave private-orders.1')
    expect(log).toContain('leave presence-rooms.1')
    expect(log).toContain('leave private-encrypted-secrets.1')
    expect(log).toContain('leave news')
  })
})
