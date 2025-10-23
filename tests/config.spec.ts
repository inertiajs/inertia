import { expect, test } from '@playwright/test'
import { requests, shouldBeDumpPage } from './support'

test.beforeEach(async ({ page }) => {
  await page.goto('/custom-config')
})

test.describe('custom config', () => {
  test('visit options', async ({ page }) => {
    await page.getByRole('button', { name: 'Post Dump' }).click()
    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.headers).toMatchObject({
      'x-from-link': 'foo',
      'x-from-callback': 'bar',
    })
  })

  test('prefetch duration', async ({ page }) => {
    const link = await page.getByRole('link', { name: 'Prefetch Link' })
    const prefetchPromise = page.waitForRequest(
      (request) => request.url().includes('/dump/get') && request.headers().purpose === 'prefetch',
    )

    // Wait for the page to be prefetched
    await link.hover()
    await prefetchPromise

    // Wait two seconds
    await page.waitForTimeout(2020)

    // Now click the link and ensure a new request is made
    requests.listen(page)
    await link.click()
    await shouldBeDumpPage(page, 'get')
    await expect(requests.requests.length).toBe(1)
  })

  test('recently successful duration', async ({ page }) => {
    const link = await page.getByRole('button', { name: 'Submit Form' })
    const message = page.getByText('Form was recently successful!')
    await link.click()
    await message.waitFor()

    await page.waitForTimeout(1020)
    await expect(message).toBeHidden()
  })
})
