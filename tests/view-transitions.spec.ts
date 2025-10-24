import { expect, test } from '@playwright/test'
import { consoleMessages } from './support'

test('navigates with boolean view transition', async ({ page }) => {
  await page.goto('/view-transition/page-a')

  await expect(page.getByText('Page A - View Transition Test')).toBeVisible()

  await page.getByRole('button', { name: 'Transition with boolean' }).click()

  await expect(page).toHaveURL('/view-transition/page-b')
  await expect(page.getByText('Page B - View Transition Test')).toBeVisible()
})

test('calls viewTransition callbacks when using callback function', async ({ page }) => {
  consoleMessages.listen(page)

  await page.goto('/view-transition/page-a')

  await expect(page.getByText('Page A - View Transition Test')).toBeVisible()

  await page.getByRole('button', { name: 'Transition with callback' }).click()

  await expect(page).toHaveURL('/view-transition/page-b')
  await expect(page.getByText('Page B - View Transition Test')).toBeVisible()

  // Wait for the 'finished' promise to resolve
  await page.waitForEvent('console', (msg) => msg.text() === 'finished')
  await expect(consoleMessages.messages).toEqual(['updateCallbackDone', 'ready', 'finished'])
})
