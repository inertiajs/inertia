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
})
