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

  await expect.poll(() => consoleMessages.messages).toEqual(['updateCallbackDone', 'ready', 'finished'])
})

test('calls viewTransition callbacks on Link component with callback function', async ({ page }) => {
  consoleMessages.listen(page)

  await page.goto('/view-transition/page-a')

  await expect(page.getByText('Page A - View Transition Test')).toBeVisible()

  await page.getByRole('link', { name: 'Link to Page B' }).click()

  await expect(page).toHaveURL('/view-transition/page-b')
  await expect(page.getByText('Page B - View Transition Test')).toBeVisible()

  await expect.poll(() => consoleMessages.messages).toEqual(['updateCallbackDone', 'ready', 'finished'])
})

test('calls viewTransition callbacks on client-side visit with callback function', async ({ page }) => {
  consoleMessages.listen(page)

  await page.goto('/view-transition/page-a')

  await expect(page.getByText('Page A - View Transition Test')).toBeVisible()

  await page.getByRole('button', { name: 'Client-side replace' }).click()

  await expect(page).toHaveURL('/view-transition/page-b')
  await expect(page.getByText('Page B - View Transition Test')).toBeVisible()

  await expect.poll(() => consoleMessages.messages).toEqual(['updateCallbackDone', 'ready', 'finished'])
})

test('does not use view transition when same page returns with validation errors', async ({ page }) => {
  consoleMessages.listen(page)

  await page.goto('/view-transition/form-errors')
  await page.getByRole('button', { name: 'Submit with View Transition' }).click()
  await expect(page.getByText('The name field is required.')).toBeVisible()

  await page.waitForTimeout(500)

  await expect(consoleMessages.messages).toEqual([])
})
