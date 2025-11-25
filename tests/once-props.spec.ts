import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/once-props/page-a')
})

test('loads the prop on initial page load and then preserves it after navigation', async ({ page }) => {
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  await page.reload()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Foo: foo-b')).toBeVisible()
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
})

test('navigating back and forward preserves the prop', async ({ page }) => {
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()

  await page.goBack()

  await expect(page).toHaveURL('/once-props/page-a')
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.goForward()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
})

test('partial reload preserves the prop', async ({ page }) => {
  const fooText = await page.locator('#foo').innerText()

  await page.getByRole('button', { name: 'Reload (only foo)' }).click()
  await expect(page.getByText(fooText)).not.toBeVisible()

  const newFooText = await page.locator('#foo').innerText()

  expect(newFooText.startsWith('Foo: foo-a')).toBe(true)
  expect(newFooText).not.toBe(fooText)

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText(newFooText)).toBeVisible()
})

test('navigating through an intermediary page without the once prop', async ({ page }) => {
  await expect(page.getByText('Foo: foo-a')).toBeVisible()
  await expect(page.getByText('Bar: bar-a')).toBeVisible()

  await page.getByRole('link', { name: 'Go to Page C' }).click()

  await expect(page).toHaveURL('/once-props/page-c')

  await page.getByRole('link', { name: 'Go to Page B' }).click()

  await expect(page).toHaveURL('/once-props/page-b')
  await expect(page.getByText('Bar: bar-b')).toBeVisible()
  await expect(page.getByText('Foo: foo-b')).toBeVisible()
})
