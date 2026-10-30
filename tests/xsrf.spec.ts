import { expect, test } from '@playwright/test'
import { shouldBeDumpPage } from './support'

test.describe('XSRF Token', () => {
  test('it automatically sends XSRF-TOKEN cookie value as X-XSRF-TOKEN header', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'XSRF-TOKEN',
        value: 'test-xsrf-token-value',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/links/method')

    await page.getByRole('button', { exact: true, name: 'POST Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')
    expect(dump.headers['x-xsrf-token']).toBe('test-xsrf-token-value')
  })

  test('it does not send X-XSRF-TOKEN header when cookie is not present', async ({ page }) => {
    await page.goto('/links/method')

    await page.getByRole('button', { exact: true, name: 'POST Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')
    expect(dump.headers['x-xsrf-token']).toBeUndefined()
  })

  test('it reads from custom cookie and header name when configured', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'MY-XSRF-TOKEN',
        value: 'custom-xsrf-token-value',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/links/method?customXsrf=MY-XSRF-TOKEN')

    await page.getByRole('button', { exact: true, name: 'POST Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')
    expect(dump.headers['x-my-xsrf-token']).toBe('custom-xsrf-token-value')
    expect(dump.headers['x-xsrf-token']).toBeUndefined()
  })

  test('it ignores default cookie when custom cookie name is configured', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'XSRF-TOKEN',
        value: 'default-token-value',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/links/method?customXsrf=MY-XSRF-TOKEN')

    await page.getByRole('button', { exact: true, name: 'POST Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')
    expect(dump.headers['x-xsrf-token']).toBeUndefined()
    expect(dump.headers['x-my-xsrf-token']).toBeUndefined()
  })

  test('it does not send X-XSRF-TOKEN header to other origins', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'XSRF-TOKEN',
        value: 'test-xsrf-token-value',
        domain: 'localhost',
        path: '/',
      },
    ])

    const externalRequests: Record<string, string>[] = []

    await page.route('https://external.example/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        externalRequests.push(route.request().headers())
      }

      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: '{}',
      })
    })

    await page.goto('/xsrf/cross-origin')

    await page.getByRole('button', { name: 'Cross-origin HTTP' }).click()
    await expect.poll(() => externalRequests.length).toBe(1)

    await page.getByRole('button', { name: 'Cross-origin Link' }).click()
    await expect.poll(() => externalRequests.length).toBe(2)

    expect(externalRequests[0]['x-xsrf-token']).toBeUndefined()
    expect(externalRequests[1]['x-xsrf-token']).toBeUndefined()

    await page.goto('/xsrf/cross-origin')
    await page.getByRole('button', { name: 'Same-origin Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')
    expect(dump.headers['x-xsrf-token']).toBe('test-xsrf-token-value')
  })
})
