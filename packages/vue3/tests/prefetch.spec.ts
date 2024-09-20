import { expect, test } from '@playwright/test'
import { requests } from './support'

test('can prefetch using link props', async ({ page }) => {
  // These two prefetch requests should be made on mount
  const prefetch2 = page.waitForResponse('prefetch/2')
  const prefetch4 = page.waitForResponse('prefetch/4')

  await page.goto('prefetch/1')

  // These two prefetch requests should be made on mount
  await prefetch2
  await prefetch4

  requests.listen(page)

  await page.getByRole('link', { name: 'On Mount' }).click()
  await page.waitForURL('prefetch/2')
  await expect(requests.requests.length).toBe(0)

  await page.getByRole('link', { name: 'On Hover + Mount' }).click()
  await page.waitForURL('prefetch/4')
  await expect(requests.requests.length).toBe(0)

  await page.getByRole('link', { name: 'On Click' }).hover()
  await page.mouse.down()
  await page.waitForResponse('prefetch/3')
  await expect(page).toHaveURL('prefetch/4')
  requests.listen(page)
  await page.mouse.up()
  await page.waitForURL('prefetch/3')
  await expect(requests.requests.length).toBe(0)

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover (Default)' }).hover()
  await page.getByRole('link', { name: 'On Click' }).hover()
  // If they just do a quick hover, it shouldn't make the request
  await expect(requests.requests.length).toBe(0)

  await page.getByRole('link', { name: 'On Hover (Default)' }).hover()
  await page.waitForResponse('prefetch/1')
  await expect(page).toHaveURL('prefetch/3')

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover (Default)' }).click()
  await page.waitForURL('prefetch/1')
  await expect(requests.requests.length).toBe(0)

  // Wait for the cache to timeout on the combo link
  await page.waitForTimeout(1200)

  await page.getByRole('link', { name: 'On Hover + Mount' }).hover()
  await page.waitForResponse('prefetch/4')
  await expect(page).toHaveURL('prefetch/1')

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover + Mount' }).click()
  await page.waitForURL('prefetch/4')
  await expect(requests.requests.length).toBe(0)
})
