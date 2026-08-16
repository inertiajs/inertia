import { expect, test } from '@playwright/test'

test('server renders, hydrates, and navigates without a document reload', async ({ page }) => {
  const documentRequests: string[] = []
  const angularErrors: string[] = []

  page.on('request', (request) => {
    if (request.resourceType() === 'document') documentRequests.push(request.url())
  })
  page.on('console', (message) => {
    if (message.type() === 'error' && /NG05\d{2}/.test(message.text())) angularErrors.push(message.text())
  })

  const response = await page.goto('/')
  expect(await response?.text()).toContain('Inertia + Angular')
  await expect(page.getByRole('heading', { name: 'Inertia + Angular' })).toBeVisible()

  await page.getByRole('link', { name: 'Users' }).click()
  await expect(page).toHaveURL('/users')
  await expect(page.getByText('User 12 — user12@example.com')).toBeVisible()
  expect(documentRequests).toHaveLength(1)
  expect(angularErrors).toEqual([])
})

test('forms, deferred props, and infinite scroll work in the Laravel application', async ({ page }) => {
  await page.goto('/form')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('The name field is required.')).toBeVisible()

  await page.getByRole('link', { name: 'Deferred' }).click()
  await expect(page.getByText('Total users: 12')).toBeVisible()

  await page.getByRole('link', { name: 'Infinite scroll' }).click()
  await expect(page.getByText('User 15', { exact: true })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.getByText('User 16', { exact: true })).toBeVisible()
})
