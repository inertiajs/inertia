import { expect, test } from '@playwright/test'

test('temporary props disappear after partial reload and remain absent on back', async ({ page }) => {
  await page.goto('/temporary-props')

  // Initially, both props are present
  await expect(page.getByText('regular is 1')).toBeVisible()
  await expect(page.getByText('tmp is 1')).toBeVisible()

  // Navigate away and then go back to ensure history state doesn't contain tmp
  await page.getByRole('link', { name: 'homepage' }).click()
  await page.waitForURL('/')
  await page.goBack()
  await page.waitForURL('/temporary-props')

  await expect(page.getByText('regular is 1')).toBeVisible()
  // tmp should be absent when pulled from history
  await expect(page.getByText('tmp is undefined')).toBeVisible()
})
