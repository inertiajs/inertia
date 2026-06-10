import test, { expect, Page } from '@playwright/test'
import { pageLoads, requests } from './support'

const listenForGlobalMessages = async (page: Page, event) => {
  await page.evaluate((eventName) => {
    // @ts-ignore
    window.globalMessages = window.globalMessages || {}

    // @ts-ignore
    window.globalMessages[eventName] = []

    document.addEventListener(eventName, (e) => {
      // @ts-ignore
      window.globalMessages[eventName].push({
        isCustomEvent: e instanceof CustomEvent,
        type: e.type,
        cancelable: e.cancelable,
        detail: e.detail,
      })
    })
  }, event)
}

const waitForGlobalMessages = async (page: Page, event: string, count?: number): Promise<any[string]> => {
  if (typeof count === 'number') {
    await page.waitForFunction(({ count, event }) => (window as any).globalMessages[event].length === count, {
      count,
      event,
    })
  }

  return await page.evaluate((event) => (window as any).globalMessages[event], event)
}

test('replaces the page client side', async ({ page, browserName }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('foo from server')).toBeVisible()
  await expect(page.getByText('bar from server')).toBeVisible()
  await expect(page.getByText('foo from client')).not.toBeVisible()
  await expect(page.getByText('Finished: 0')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await page.getByRole('button', { name: 'Replace', exact: true }).click()

  await expect(page).toHaveURL('/client-side-visit')
  await expect(page.getByText('foo from server')).not.toBeVisible()
  await expect(page.getByText('foo from client')).toBeVisible()
  await expect(page.getByText('bar from server')).toBeVisible()
  await expect(page.getByText('Finished: 1')).toBeVisible()
  await expect(page.getByText('Success: 1')).toBeVisible()

  await expect(requests.requests.length).toBe(0)

  const historyLength = await page.evaluate(() => window.history.length)
  // Firefox doesn't count the initial about:blank page in history.length
  await expect(historyLength).toBe(browserName === 'firefox' ? 1 : 2)
})

test('preserves the state based on the errors object', async ({ page }) => {
  await page.goto('/client-side-visit')
  const randomValue = await page.locator('#random').innerText()

  await page.getByRole('button', { name: 'Replace with errors' }).click()
  const randomValueAfter = await page.locator('#random').innerText()
  await expect(randomValueAfter).toBe(randomValue)

  await page.getByRole('button', { name: 'Replace without errors' }).click()
  const randomValueAfterSecond = await page.locator('#random').innerText()
  await expect(randomValueAfterSecond).not.toBe(randomValue)
})

test('fires an onError callback when the props has errors', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('Errors: 0')).toBeVisible()
  await expect(page.getByText('Finished: 0')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await page.getByRole('button', { name: 'Errors (default)' }).click()

  await expect(page.getByText('Finished: 1')).toBeVisible()
  await expect(page.getByText('Errors: 2')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await expect(requests.requests.length).toBe(0)
})

test('fires an onError callback when the props has errors in a custom bag', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('Errors: 0')).toBeVisible()
  await expect(page.getByText('Finished: 0')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()

  await page.getByRole('button', { name: 'Errors (bag)' }).click()

  await expect(page.getByText('Finished: 1')).toBeVisible()
  await expect(page.getByText('Errors: 1')).toBeVisible()
  await expect(page.getByText('Success: 0')).toBeVisible()
  await expect(requests.requests.length).toBe(0)
})

test('pushes the page client side', async ({ page, browserName }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')

  requests.listen(page)

  await expect(page.getByText('foo from server')).toBeVisible()
  await expect(page.getByText('bar from server')).toBeVisible()
  await expect(page.getByText('baz from client')).not.toBeVisible()

  await page.getByRole('button', { name: 'Push', exact: true }).click()

  await expect(page).toHaveURL('/client-side-visit-2')
  await expect(page.getByText('foo from server')).not.toBeVisible()
  await expect(page.getByText('bar from server')).not.toBeVisible()
  await expect(page.getByText('baz from client')).toBeVisible()

  await expect(requests.requests.length).toBe(0)

  const historyLength = await page.evaluate(() => window.history.length)
  // Firefox doesn't count the initial about:blank page in history.length
  await expect(historyLength).toBe(browserName === 'firefox' ? 2 : 3)
})

test('it pairs client-side push visitId with navigate', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')
  await listenForGlobalMessages(page, 'inertia:navigate')
  await listenForGlobalMessages(page, 'inertia:clientVisit')

  await page.getByRole('button', { name: 'Push', exact: true }).click()

  const clientVisitMessages = await waitForGlobalMessages(page, 'inertia:clientVisit', 1)
  const navigateMessages = await waitForGlobalMessages(page, 'inertia:navigate', 1)
  const visitId = clientVisitMessages[0].detail.visitId

  await expect(clientVisitMessages[0].detail.replace).toBe(false)
  await expect(typeof visitId).toBe('number')
  await expect(navigateMessages[0].detail.visitId).toBe(visitId)
})

test('it records client-side replace visitIds without navigate events', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/client-side-visit')
  await listenForGlobalMessages(page, 'inertia:navigate')
  await listenForGlobalMessages(page, 'inertia:clientVisit')

  await page.getByRole('button', { name: 'Replace', exact: true }).click()

  const replaceClientVisitMessages = await waitForGlobalMessages(page, 'inertia:clientVisit', 1)
  const replaceNavigateMessages = await waitForGlobalMessages(page, 'inertia:navigate')

  await expect(replaceClientVisitMessages[0].detail.replace).toBe(true)
  await expect(typeof replaceClientVisitMessages[0].detail.visitId).toBe('number')
  await expect(replaceNavigateMessages).toHaveLength(0)

  await page.getByRole('button', { name: 'Push same URL' }).click()

  const clientVisitMessages = await waitForGlobalMessages(page, 'inertia:clientVisit', 2)
  const navigateMessages = await waitForGlobalMessages(page, 'inertia:navigate')

  await expect(clientVisitMessages[1].detail.replace).toBe(false)
  await expect(typeof clientVisitMessages[1].detail.visitId).toBe('number')
  await expect(navigateMessages).toHaveLength(0)
})
