import { expect, Page, test } from '@playwright/test'
import { pageLoads, shouldBeDumpPage } from './support'

const reload = async (page: Page) => {
  const responsePromise = page.waitForResponse('**/socket-id')
  await page.getByRole('button', { name: 'Reload' }).click()
  await responsePromise
}

test.describe('Socket id', () => {
  test('it sends the resolved socket id along with visits', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/socket-id')

    await expect(page.locator('#header')).toHaveText('none')

    await page.getByRole('button', { name: 'Register Resolver' }).click()
    await expect(page.locator('#resolved')).toHaveText('socket-abc-123')

    await reload(page)
    await expect(page.locator('#header')).toHaveText('socket-abc-123')

    const requestPromise = page.waitForRequest('**/dump/get')
    await page.getByRole('button', { name: 'Visit Dump Page' }).click()
    const request = await requestPromise

    expect(await request.headerValue('x-socket-id')).toBe('socket-abc-123')

    const dump = await shouldBeDumpPage(page, 'get')
    expect(dump.headers['x-socket-id']).toBe('socket-abc-123')
  })

  test('it keeps a socket id the visit set itself', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/socket-id')

    await page.getByRole('button', { name: 'Register Resolver' }).click()
    await expect(page.locator('#resolved')).toHaveText('socket-abc-123')

    const requestPromise = page.waitForRequest('**/dump/get')
    await page.getByRole('button', { name: 'Send Own Socket Id' }).click()
    const request = await requestPromise

    expect(await request.headerValue('x-socket-id')).toBe('socket-set-by-app')

    const dump = await shouldBeDumpPage(page, 'get')
    expect(dump.headers['x-socket-id']).toBe('socket-set-by-app')
  })

  test('it sends the socket id again after the resolver is cleared and re-registered', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/socket-id')

    await page.getByRole('button', { name: 'Register Resolver' }).click()
    await page.getByRole('button', { name: 'Clear Resolver' }).click()
    await expect(page.locator('#resolved')).toHaveText('none')

    await reload(page)
    await expect(page.locator('#header')).toHaveText('none')

    await page.getByRole('button', { name: 'Register Resolver' }).click()

    await reload(page)
    await expect(page.locator('#header')).toHaveText('socket-abc-123')
  })

  test('it omits the header when there is no resolver or the resolver has no socket id', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/socket-id')

    await reload(page)
    await expect(page.locator('#header')).toHaveText('none')

    await page.getByRole('button', { name: 'Register Empty Resolver' }).click()
    await expect(page.locator('#resolved')).toHaveText('none')

    await reload(page)
    await expect(page.locator('#header')).toHaveText('none')

    await page.getByRole('button', { name: 'Register Resolver' }).click()
    await page.getByRole('button', { name: 'Clear Resolver' }).click()
    await expect(page.locator('#resolved')).toHaveText('none')

    const requestPromise = page.waitForRequest('**/dump/get')
    await page.getByRole('button', { name: 'Visit Dump Page' }).click()
    const request = await requestPromise

    expect(await request.headerValue('x-socket-id')).toBeNull()
  })
})
