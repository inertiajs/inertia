import { expect, test } from '@playwright/test'
import { consoleMessages } from './support'

test.describe('ClientOnly', () => {
  test('it renders the children once mounted', async ({ page }) => {
    consoleMessages.listen(page)

    await page.goto('/client-only')

    await expect(page.getByTestId('client-only-content')).toHaveText('Client path: /client-only')
    await expect(page.getByTestId('client-only-fallback')).toHaveCount(0)

    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it renders the children again after navigating back to the page', async ({ page }) => {
    await page.goto('/client-only')
    await expect(page.getByTestId('client-only-content')).toBeVisible()

    await page.goto('/dump/get')
    await page.goBack()

    await expect(page.getByTestId('client-only-content')).toHaveText('Client path: /client-only')
    await expect(page.getByTestId('client-only-fallback')).toHaveCount(0)
  })
})
