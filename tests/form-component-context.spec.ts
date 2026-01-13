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
      // Initial state
      await expect(page.getByText('Parent: Form is clean')).toBeVisible()
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      // Make form dirty
      await page.locator('input[name="name"]').fill('Jane Doe')
      await expect(page.getByText('Parent: Form is dirty')).toBeVisible()
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      // Set error from child - both should reflect it
      await page.getByRole('button', { name: 'Set Error' }).click()
      await expect(page.getByText('Error set from child component')).toHaveCount(2)
      await expect(page.getByText('Parent: Form has errors')).toBeVisible()
      await expect(page.getByText('Child: Form has errors')).toBeVisible()
    })

    test('it can call form methods from child component', async ({ page }) => {
      // Test reset
      await page.locator('input[name="name"]').fill('Changed Name')
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      await page.getByRole('button', { name: 'Reset from Child' }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('John Doe')
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      // Test error management
      await page.getByRole('button', { name: 'Set Error' }).click()
      await expect(page.getByText('Error set from child component').first()).toBeVisible()

      await page.getByRole('button', { name: 'Clear Error' }).click()
      await expect(page.getByText('Error set from child component')).not.toBeVisible()

      // Test defaults
      await page.locator('input[name="name"]').fill('New Default')
      await page.getByRole('button', { name: 'Set Defaults' }).click()
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      await page.locator('input[name="name"]').fill('Something else')
      await page.getByRole('button', { name: 'Reset from Child' }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('New Default')

      // Test submit
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

      // Reset all
      await page.getByRole('button', { name: 'reset()', exact: true }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Initial bio')

      // Reset specific field
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.getByRole('button', { name: "reset('name')", exact: true }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('changed@example.com')

      // Reset multiple fields
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('textarea[name="bio"]').fill('Changed bio')
      await page.getByRole('button', { name: "reset('name', 'email')" }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Changed bio')
    })

    test('it can manage errors from child', async ({ page }) => {
      // Set single error
      await page.getByRole('button', { name: "setError('name')" }).click()
      await expect(page.getByText('Name is invalid').first()).toBeVisible()

      // Clear specific error
      await page.getByRole('button', { name: "clearErrors('name')", exact: true }).click()
      await expect(page.getByText('Name is invalid')).not.toBeVisible()

      // Set multiple errors
      await page.getByRole('button', { name: 'setError({...})' }).click()
      await expect(page.getByText('Name error from child').first()).toBeVisible()
      await expect(page.getByText('Email error from child').first()).toBeVisible()
      await expect(page.getByText('Bio error from child').first()).toBeVisible()

      // Clear all errors
      await page.getByRole('button', { name: 'clearErrors()', exact: true }).click()
      await expect(page.getByText('Name error from child')).not.toBeVisible()
      await expect(page.getByText('Email error from child')).not.toBeVisible()
    })

    test('it can reset and clear errors together from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.getByRole('button', { name: 'setError({...})' }).click()

      // Reset and clear specific field
      await page.getByRole('button', { name: "resetAndClearErrors('name')" }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.getByText('Name error from child')).not.toBeVisible()
      await expect(page.locator('input[name="email"]')).toHaveValue('changed@example.com')
      await expect(page.getByText('Email error from child').first()).toBeVisible()

      // Reset and clear all
      await page.getByRole('button', { name: 'resetAndClearErrors()', exact: true }).click()
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.getByText('Email error from child')).not.toBeVisible()
    })

    test('it can access data methods from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Test Name')
      await page.locator('input[name="email"]').fill('test@example.com')

      // getData() - verify result contains expected data
      await page.getByRole('button', { name: 'getData()' }).click()
      await expect(page.locator('pre').first()).toContainText('Test Name')
      await expect(page.locator('pre').first()).toContainText('test@example.com')

      // getFormData() - verify it also works
      await page.getByRole('button', { name: 'getFormData()' }).click()
      await expect(page.locator('pre').nth(1)).toContainText('Test Name')
    })

    test('it exposes success states through context', async ({ page }) => {
      // Initially no success states
      await expect(page.getByText('Child: was successful')).not.toBeVisible()
      await expect(page.getByText('Child: recently successful')).not.toBeVisible()

      // Submit and stay on same page
      await page.getByRole('button', { name: 'submit()' }).click()
      await page.waitForResponse((response) => response.url().includes('/form-component/context/methods'))

      // Success states should be visible via context
      await expect(page.getByText('Child: was successful')).toBeVisible()
      await expect(page.getByText('Child: recently successful')).toBeVisible()

      // recentlySuccessful becomes false after timeout
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
      // Both forms start clean
      await expect(page.getByText('Child: Form is clean').first()).toBeVisible()
      await expect(page.getByText('Child: Form is clean').nth(1)).toBeVisible()

      // Make form 1 dirty - form 2 should stay clean
      await page.locator('input[name="name"]').first().fill('Changed')
      await expect(page.getByText('Form 1 Parent: dirty')).toBeVisible()
      await expect(page.getByText('Form 2 Parent: clean')).toBeVisible()

      // Set error in form 1 - form 2 should not be affected
      await page.getByRole('button', { name: 'Set Error' }).first().click()
      await expect(page.getByText('Error: Error from child')).toHaveCount(2) // Parent + Child of form 1

      // Set error in form 2
      await page.getByRole('button', { name: 'Set Error' }).nth(1).click()
      await expect(page.getByText('Error: Error from child')).toHaveCount(4) // Both forms

      // Clear error in form 1 - form 2 should keep its error
      await page.getByRole('button', { name: 'Clear Error' }).first().click()
      await expect(page.getByText('Error: Error from child')).toHaveCount(2) // Only form 2
    })
  })
})
