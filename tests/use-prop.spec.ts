import { expect, test } from '@playwright/test'
import { gotoPageAndWaitForContent, pageLoads } from './support'

test.describe('useProp', () => {
  test('it tracks the loading state of a deferred prop until it arrives', async ({ page }) => {
    pageLoads.watch(page)
    await gotoPageAndWaitForContent(page, '/use-prop')

    await expect(page.locator('#orders-value')).toHaveText('none')
    await expect(page.locator('#orders-loading')).toHaveText('true')
    await expect(page.locator('#orders-loaded')).toHaveText('false')

    await expect(page.locator('#users-loading')).toHaveText('false')

    await expect(page.locator('#orders-loading')).toHaveText('false')
    await expect(page.locator('#orders-loaded')).toHaveText('true')
    await expect(page.locator('#orders-value')).toContainText('orders-')
  })

  test('it tracks loading state per prop', async ({ page }) => {
    // Waits on four deliberately slow responses in a row
    test.setTimeout(15_000)

    pageLoads.watch(page)
    await page.goto('/use-prop')
    await expect(page.locator('#orders-loaded')).toHaveText('true')

    const initialUsers = await page.locator('#users-value').textContent()
    const initialStats = await page.locator('#stats-value').textContent()

    await page.getByRole('button', { name: 'Reload Users', exact: true }).click()

    await expect(page.locator('#users-loading')).toHaveText('true')
    await expect(page.locator('#stats-loading')).toHaveText('false')
    await expect(page.locator('#user-name-loading')).toHaveText('false')

    await expect(page.locator('#users-loading')).toHaveText('false')
    await expect(page.locator('#users-value')).not.toHaveText(initialUsers!)
    await expect(page.locator('#stats-value')).toHaveText(initialStats!)

    await page.getByRole('button', { name: 'Reload Except Users' }).click()

    await expect(page.locator('#stats-loading')).toHaveText('true')
    await expect(page.locator('#users-loading')).toHaveText('false')

    await expect(page.locator('#stats-loading')).toHaveText('false')

    await page.getByRole('button', { name: 'Reset Users' }).click()

    await expect(page.locator('#users-loading')).toHaveText('true')
    await expect(page.locator('#stats-loading')).toHaveText('false')

    await expect(page.locator('#users-loading')).toHaveText('false')
  })

  test('it tracks dot-path keys down to the requested path', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/use-prop')
    await expect(page.locator('#orders-loaded')).toHaveText('true')

    await page.getByRole('button', { name: 'Reload User Name' }).click()

    await expect(page.locator('#user-name-loading')).toHaveText('true')
    await expect(page.locator('#user-email-loading')).toHaveText('false')
    await expect(page.locator('#users-loading')).toHaveText('false')

    await expect(page.locator('#user-name-loading')).toHaveText('false')
  })

  test('it marks every prop as loading during a full reload', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/use-prop')
    await expect(page.locator('#orders-loaded')).toHaveText('true')

    await page.getByRole('button', { name: 'Reload Everything' }).click()

    await expect(page.locator('#users-loading')).toHaveText('true')
    await expect(page.locator('#stats-loading')).toHaveText('true')
    await expect(page.locator('#user-name-loading')).toHaveText('true')
    await expect(page.locator('#orders-loading')).toHaveText('true')

    await expect(page.locator('#users-loading')).toHaveText('false')
  })

  test('it stops tracking a request that was cancelled before it went out', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/use-prop')
    await expect(page.locator('#orders-loaded')).toHaveText('true')

    await page.getByRole('button', { name: 'Cancel Users Immediately' }).click()

    await expect(page.locator('#users-loading')).toHaveText('false')
    await expect(page.locator('#stats-loading')).toHaveText('false')

    // A leaked registration would claim every prop forever, so a later reload
    // has to still report its own loading state
    const initialUsers = await page.locator('#users-value').textContent()

    await page.getByRole('button', { name: 'Reload Users', exact: true }).click()

    await expect(page.locator('#users-loading')).toHaveText('true')
    await expect(page.locator('#users-loading')).toHaveText('false')
    await expect(page.locator('#users-value')).not.toHaveText(initialUsers!)
  })

  test('it keeps a prop loading until every request claiming it has finished', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/use-prop')
    await expect(page.locator('#orders-loaded')).toHaveText('true')

    const slowResponse = page.waitForResponse((response) => response.url().includes('delay=900'))
    const fastResponse = page.waitForResponse((response) => response.url().includes('delay=300'))

    await page.getByRole('button', { name: 'Reload Users Twice' }).click()

    await expect(page.locator('#users-loading')).toHaveText('true')

    await fastResponse
    await expect(page.locator('#users-loading')).toHaveText('true')

    await slowResponse
    await expect(page.locator('#users-loading')).toHaveText('false')
  })
})
