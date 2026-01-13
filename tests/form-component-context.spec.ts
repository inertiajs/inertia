import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Form Component Context', () => {
  test.describe('Basic Context', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context/default')
    })

    test('it provides context to child and deeply nested components', async ({ page }) => {
      await expect(page.getByText('Child: Form is clean')).toBeVisible()
      await expect(page.getByText('Deeply Nested: Form is clean')).toBeVisible()
    })

    test('it returns undefined outside Form component', async ({ page }) => {
      await expect(page.getByText('Correctly returns undefined when used outside a Form component')).toBeVisible()
    })

    test('it syncs state between parent and child', async ({ page }) => {
      await expect(page.getByText('Parent: Form is clean')).toBeVisible()
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      await page.locator('input[name="name"]').fill('Jane Doe')
      await expect(page.getByText('Parent: Form is dirty')).toBeVisible()
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      await page.getByRole('button', { name: 'Set Error' }).click()
      await expect(page.getByText('Error set from child component')).toHaveCount(2)
      await expect(page.getByText('Parent: Form has errors')).toBeVisible()
      await expect(page.getByText('Child: Form has errors')).toBeVisible()
    })

    test('it can call form methods from child component', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Changed Name')
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      await page.getByRole('button', { name: 'Reset from Child' }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('John Doe')
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      await page.getByRole('button', { name: 'Set Error' }).click()
      await expect(page.getByText('Error set from child component').first()).toBeVisible()

      await page.getByRole('button', { name: 'Clear Error' }).click()
      await expect(page.getByText('Error set from child component')).not.toBeVisible()

      await page.locator('input[name="name"]').fill('New Default')
      await page.getByRole('button', { name: 'Set Defaults' }).click()
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      await page.locator('input[name="name"]').fill('Something else')
      await page.getByRole('button', { name: 'Reset from Child' }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('New Default')

      await page.getByRole('button', { name: 'Submit from Child' }).click()
      await page.waitForURL('/dump/post')
    })
  })

  test.describe('Context Methods', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context/methods')
    })

    test('it can reset fields from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.locator('textarea[name="bio"]').fill('Changed bio')

      await page.getByRole('button', { name: 'reset()', exact: true }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Initial bio')

      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.getByRole('button', { name: "reset('name')", exact: true }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('changed@example.com')

      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('textarea[name="bio"]').fill('Changed bio')
      await page.getByRole('button', { name: "reset('name', 'email')" }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Changed bio')
    })

    test('it can manage errors from child', async ({ page }) => {
      await page.getByRole('button', { name: "setError('name')" }).click()
      await expect(page.getByText('Name is invalid').first()).toBeVisible()

      await page.getByRole('button', { name: "clearErrors('name')", exact: true }).click()
      await expect(page.getByText('Name is invalid')).not.toBeVisible()

      await page.getByRole('button', { name: 'setError({...})' }).click()
      await expect(page.getByText('Name error from child').first()).toBeVisible()
      await expect(page.getByText('Email error from child').first()).toBeVisible()
      await expect(page.getByText('Bio error from child').first()).toBeVisible()

      await page.getByRole('button', { name: 'clearErrors()', exact: true }).click()
      await expect(page.getByText('Name error from child')).not.toBeVisible()
      await expect(page.getByText('Email error from child')).not.toBeVisible()
    })

    test('it can reset and clear errors together from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.getByRole('button', { name: 'setError({...})' }).click()

      await page.getByRole('button', { name: "resetAndClearErrors('name')" }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.getByText('Name error from child')).not.toBeVisible()
      await expect(page.locator('input[name="email"]')).toHaveValue('changed@example.com')
      await expect(page.getByText('Email error from child').first()).toBeVisible()

      await page.getByRole('button', { name: 'resetAndClearErrors()', exact: true }).click()
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.getByText('Email error from child')).not.toBeVisible()
    })

    test('it can access data methods from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Test Name')
      await page.locator('input[name="email"]').fill('test@example.com')

      await page.getByRole('button', { name: 'getData()' }).click()
      await expect(page.locator('#get-data-result')).toContainText('Test Name')
      await expect(page.locator('#get-data-result')).toContainText('test@example.com')

      await page.getByRole('button', { name: 'getFormData()' }).click()
      await expect(page.locator('#get-form-data-result')).toContainText('Test Name')
    })

    test('it exposes success states through context', async ({ page }) => {
      await expect(page.getByText('Child: was successful')).not.toBeVisible()
      await expect(page.getByText('Child: recently successful')).not.toBeVisible()

      await page.getByRole('button', { name: 'submit()' }).click()
      await page.waitForResponse((response) => response.url().includes('/form-component/context/methods'))

      await expect(page.getByText('Child: was successful')).toBeVisible()
      await expect(page.getByText('Child: recently successful')).toBeVisible()

      await page.waitForTimeout(2100)
      await expect(page.getByText('Child: was successful')).toBeVisible()
      await expect(page.getByText('Child: recently successful')).not.toBeVisible()
    })
  })

  test.describe('Multiple Forms', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context/multiple')
    })

    test('it provides isolated context to each form', async ({ page }) => {
      await expect(page.getByText('Child: Form is clean').first()).toBeVisible()
      await expect(page.getByText('Child: Form is clean').nth(1)).toBeVisible()

      await page.locator('input[name="name"]').first().fill('Changed')
      await expect(page.getByText('Form 1 Parent: dirty')).toBeVisible()
      await expect(page.getByText('Form 2 Parent: clean')).toBeVisible()

      await page.getByRole('button', { name: 'Set Error' }).first().click()
      await expect(page.getByText('Error: Error from child')).toHaveCount(2)

      await page.getByRole('button', { name: 'Set Error' }).nth(1).click()
      await expect(page.getByText('Error: Error from child')).toHaveCount(4)

      await page.getByRole('button', { name: 'Clear Error' }).first().click()
      await expect(page.getByText('Error: Error from child')).toHaveCount(2)
    })
  })
})
