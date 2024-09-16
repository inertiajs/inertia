import { expect, test } from '@playwright/test'
import { requests } from './support'

test('will start polling when the component mounts with usePoll', async ({ page }) => {
  await page.goto('/poll/hook')
  requests.listen(page)
  await page.waitForTimeout(2000)

  await expect(requests.requests).toHaveLength(2)

  // TODO: Also check for params we sent through and console messages for on finish
  expect(requests.requests[0].url()).toContain('/poll/hook')
  expect(requests.requests[1].url()).toContain('/poll/hook')

  await page.getByRole('link', { name: 'Home' }).click()

  await expect(page).toHaveURL('/')

  requests.listen(page)

  await page.waitForTimeout(1200)

  await expect(requests.requests).toHaveLength(0)
})

test.skip('you can manually start and stop via router.poll', async ({ page }) => {})
test.skip('you can manually start and stop via usePoll', async ({ page }) => {})
test.skip('custom reload params are included in usePoll request', async ({ page }) => {})
test.skip('custom reload params are included in router.poll request', async ({ page }) => {})
test.skip('it will throttle polling when in the background', async ({ page }) => {})
test.skip('it is able to keep alive when in the background', async ({ page }) => {})
