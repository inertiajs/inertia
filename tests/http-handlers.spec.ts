import { expect, Page, test } from '@playwright/test'
import { pageLoads, shouldBeDumpPage } from './support'

const getMessages = (page: Page): Promise<string[]> => {
  return page.evaluate(() => (window as any)._http_handler_messages || [])
}

test.describe('HTTP Handlers', () => {
  test('it can modify request config via onRequest handler', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/http-handlers')

    await page.getByRole('button', { name: 'Register Request Handler' }).click()

    const responsePromise = page.waitForResponse('**/dump/get')
    await page.getByRole('button', { name: 'Make Request' }).click()
    await responsePromise

    const dump = await shouldBeDumpPage(page, 'get')
    expect(dump.headers['x-custom-header']).toBe('custom-value')

    const messages = await getMessages(page)
    expect(messages).toContain('request-handler-called')
  })

  test('it can intercept responses via onResponse handler', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/http-handlers')

    await page.getByRole('button', { name: 'Register Response Handler' }).click()

    const responsePromise = page.waitForResponse('**/dump/get')
    await page.getByRole('button', { name: 'Make Request' }).click()
    await responsePromise

    await shouldBeDumpPage(page, 'get')

    const messages = await getMessages(page)
    expect(messages).toContain('response-handler-called:200')
  })

  test('it can handle errors via onError handler', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/http-handlers')

    await page.getByRole('button', { name: 'Register Error Handler' }).click()

    const responsePromise = page.waitForResponse('**/http-handlers/error')
    await page.getByRole('button', { name: 'Make Error Request' }).click()
    await responsePromise

    await page.waitForFunction(() => (window as any)._http_handler_messages?.length > 0)

    const messages = await getMessages(page)
    expect(messages).toContain('error-handler-called:HttpResponseError')
  })

  test('it returns an unsubscribe function that removes the handler', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/http-handlers')

    await page.getByRole('button', { name: 'Register Request Handler' }).click()
    await page.getByRole('button', { name: 'Unregister All' }).click()

    const responsePromise = page.waitForResponse('**/dump/get')
    await page.getByRole('button', { name: 'Make Request' }).click()
    await responsePromise

    const dump = await shouldBeDumpPage(page, 'get')
    expect(dump.headers['x-custom-header']).toBeUndefined()

    const messages = await getMessages(page)
    expect(messages).toContain('unregistered')
    expect(messages).not.toContain('request-handler-called')
  })

  test('it runs multiple handlers in order', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/http-handlers')

    await page.getByRole('button', { name: 'Register Request Handler' }).click()
    await page.getByRole('button', { name: 'Register Response Handler' }).click()

    const responsePromise = page.waitForResponse('**/dump/get')
    await page.getByRole('button', { name: 'Make Request' }).click()
    await responsePromise

    await shouldBeDumpPage(page, 'get')

    const messages = await getMessages(page)
    expect(messages).toContain('request-handler-called')
    expect(messages).toContain('response-handler-called:200')
  })
})
