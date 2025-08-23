import { expect, test } from '@playwright/test'

test('form with default values loads with pre-filled fields', async ({ page }) => {
  await page.goto('/default-values')

  await expect(page.locator('h1')).toHaveText('Form with Default Values')
  await expect(page.locator('input[name="name"]')).toHaveValue('John Doe')
  await expect(page.locator('input[name="email"]')).toHaveValue('john@example.com')
  await expect(page.locator('select[name="role"]')).toHaveValue('admin')
  await expect(page.locator('input[name="newsletter"]')).toBeChecked()
  await expect(page.locator('input[name="preferences"][value="option2"]')).toBeChecked()
  await expect(page.locator('text=Form is clean')).toBeVisible()
})

test('form becomes dirty when fields are changed', async ({ page }) => {
  await page.goto('/default-values')

  await expect(page.locator('text=Form is clean')).toBeVisible()
  await page.locator('input[name="name"]').fill('Jane Doe')
  await expect(page.locator('text=Form is dirty')).toBeVisible()
})

test('form can be reset to default values', async ({ page }) => {
  await page.goto('/default-values')

  await page.locator('input[name="name"]').fill('Jane Doe')
  await expect(page.locator('text=Form is dirty')).toBeVisible()
})

test('form supports different field types with default values', async ({ page }) => {
  await page.goto('/default-values')

  await expect(page.locator('input[name="name"]')).toHaveValue('John Doe')
  await expect(page.locator('input[name="email"]')).toHaveValue('john@example.com')
  await expect(page.locator('select[name="role"]')).toHaveValue('admin')
  await expect(page.locator('input[name="newsletter"]')).toBeChecked()
  await expect(page.locator('input[name="preferences"][value="option2"]')).toBeChecked()
  await expect(page.locator('input[name="preferences"][value="option1"]')).not.toBeChecked()
  await expect(page.locator('input[name="preferences"][value="option3"]')).not.toBeChecked()
})
