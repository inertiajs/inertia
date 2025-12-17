import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Form Component Context', () => {
  test.describe('Basic Context', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context/default')
    })

    test('provides context to child components', async ({ page }) => {
      await expect(page.getByText('Child: Form is clean')).toBeVisible()
    })

    test('provides context to deeply nested components', async ({ page }) => {
      await expect(page.getByText('Deeply Nested: Form is clean')).toBeVisible()
    })

    test('returns undefined outside Form component', async ({ page }) => {
      await expect(page.getByText('Correctly returns undefined when used outside a Form component')).toBeVisible()
    })

    test('syncs isDirty state between parent and child', async ({ page }) => {
      // Initial state - clean
      await expect(page.getByText('Parent: Form is clean')).toBeVisible()
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      // Make form dirty
      await page.locator('input[name="name"]').fill('Jane Doe')

      // Both parent and child should show dirty
      await expect(page.getByText('Parent: Form is dirty')).toBeVisible()
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()
    })

    test('can submit form from child component using context', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Test Name')
      await page.locator('input[name="email"]').fill('test@example.com')

      // Submit from child component
      await page.getByRole('button', { name: 'Submit from Child' }).click()

      // Should navigate to dump page
      await page.waitForURL('/dump/post')
    })

    test('can reset form from child component using context', async ({ page }) => {
      // Change the default values
      await page.locator('input[name="name"]').fill('Changed Name')
      await page.locator('input[name="email"]').fill('changed@example.com')

      // Verify form is dirty
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      // Reset from child
      await page.getByRole('button', { name: 'Reset from Child' }).click()

      // Should be reset to defaults
      await expect(page.locator('input[name="name"]')).toHaveValue('John Doe')
      await expect(page.locator('input[name="email"]')).toHaveValue('john@example.com')
      await expect(page.getByText('Child: Form is clean')).toBeVisible()
    })

    test('can set errors from child component using context', async ({ page }) => {
      // Set error from child
      await page.getByRole('button', { name: 'Set Error' }).click()

      // Both parent and child should show the error
      await expect(page.getByText('Error set from child component')).toHaveCount(2)
      await expect(page.getByText('Parent: Form has errors')).toBeVisible()
      await expect(page.getByText('Child: Form has errors')).toBeVisible()
    })

    test('can clear errors from child component using context', async ({ page }) => {
      // First set an error
      await page.getByRole('button', { name: 'Set Error' }).click()
      await expect(page.getByText('Error set from child component').first()).toBeVisible()

      // Clear errors from child
      await page.getByRole('button', { name: 'Clear Error' }).click()

      // Errors should be cleared
      await expect(page.getByText('Error set from child component')).not.toBeVisible()
    })

    test('can set defaults from child component using context', async ({ page }) => {
      // Change values
      await page.locator('input[name="name"]').fill('New Default Name')
      await page.locator('input[name="email"]').fill('newdefault@example.com')

      // Form should be dirty
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      // Set new defaults from child
      await page.getByRole('button', { name: 'Set Defaults' }).click()

      // Form should now be clean (because current values are now the defaults)
      await expect(page.getByText('Child: Form is clean')).toBeVisible()

      // Reset should now go back to the new defaults
      await page.locator('input[name="name"]').fill('Another Name')
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()

      await page.getByRole('button', { name: 'Reset from Child' }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('New Default Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('newdefault@example.com')
    })
  })

  test.describe('Context Methods', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context/methods')
    })

    test('child can access all state properties through context', async ({ page }) => {
      // Check initial state values are all false
      const booleanStates = page.locator('span').filter({ hasText: /^(true|false)$/ })
      await expect(booleanStates.first()).toHaveText('false') // isDirty
      await expect(booleanStates.nth(1)).toHaveText('false') // hasErrors
      await expect(booleanStates.nth(2)).toHaveText('false') // processing
      await expect(booleanStates.nth(3)).toHaveText('false') // wasSuccessful
      await expect(booleanStates.nth(4)).toHaveText('false') // recentlySuccessful
    })

    test('can submit from child using context', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Test')
      await page.locator('input[name="email"]').fill('test@example.com')

      await page.getByRole('button', { name: 'submit()' }).click()

      await page.waitForURL('/dump/post')
    })

    test('can reset all fields from child', async ({ page }) => {
      // Change all fields
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.locator('textarea[name="bio"]').fill('Changed bio')

      // Reset all
      await page.getByRole('button', { name: 'reset()', exact: true }).click()

      // Should be back to defaults
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Initial bio')
    })

    test('can reset specific field from child', async ({ page }) => {
      // Change fields
      await page.locator('input[name="name"]').fill('Changed Name')
      await page.locator('input[name="email"]').fill('changed@example.com')

      // Reset only name
      await page.getByRole('button', { name: "reset('name')", exact: true }).click()

      // Name should be reset, email should stay changed
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('changed@example.com')
    })

    test('can reset multiple specific fields from child', async ({ page }) => {
      // Change fields
      await page.locator('input[name="name"]').fill('Changed Name')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.locator('textarea[name="bio"]').fill('Changed bio')

      // Reset name and email
      await page.getByRole('button', { name: "reset('name', 'email')" }).click()

      // Name and email should be reset, bio should stay changed
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.locator('input[name="email"]')).toHaveValue('initial@example.com')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Changed bio')
    })

    test('can set single error from child', async ({ page }) => {
      await page.getByRole('button', { name: "setError('name')" }).click()

      // Check error appears (shown in both parent and child, so use first())
      await expect(page.getByText('Name is invalid').first()).toBeVisible()
    })

    test('can set multiple errors from child', async ({ page }) => {
      await page.getByRole('button', { name: 'setError({...})' }).click()

      // Check all errors appear (shown in both parent and child, so use first())
      await expect(page.getByText('Name error from child').first()).toBeVisible()
      await expect(page.getByText('Email error from child').first()).toBeVisible()
      await expect(page.getByText('Bio error from child').first()).toBeVisible()
    })

    test('can clear all errors from child', async ({ page }) => {
      // Set errors first
      await page.getByRole('button', { name: 'setError({...})' }).click()
      await expect(page.getByText('Name error from child').first()).toBeVisible()

      // Clear all errors
      await page.getByRole('button', { name: 'clearErrors()', exact: true }).click()

      await expect(page.getByText('Name error from child')).not.toBeVisible()
      await expect(page.getByText('Email error from child')).not.toBeVisible()
      await expect(page.getByText('Bio error from child')).not.toBeVisible()
    })

    test('can clear specific error from child', async ({ page }) => {
      // Set multiple errors
      await page.getByRole('button', { name: 'setError({...})' }).click()

      // Clear only name error
      await page.getByRole('button', { name: "clearErrors('name')", exact: true }).click()

      // Name error should be cleared, others should remain
      await expect(page.getByText('Name error from child')).not.toBeVisible()
      await expect(page.getByText('Email error from child').first()).toBeVisible()
      await expect(page.getByText('Bio error from child').first()).toBeVisible()
    })

    test('can reset and clear errors together from child', async ({ page }) => {
      // Change values and set errors
      await page.locator('input[name="name"]').fill('Changed')
      await page.getByRole('button', { name: "setError('name')" }).click()
      await expect(page.getByText('Name is invalid').first()).toBeVisible()

      // Reset and clear errors
      await page.getByRole('button', { name: 'resetAndClearErrors()', exact: true }).click()

      // Both should be cleared
      await expect(page.getByText('Name is invalid')).not.toBeVisible()
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
    })

    test('can reset specific field and clear its error from child', async ({ page }) => {
      // Set errors and change values
      await page.locator('input[name="name"]').fill('Changed')
      await page.locator('input[name="email"]').fill('changed@example.com')
      await page.getByRole('button', { name: 'setError({...})' }).click()

      // Reset and clear only name
      await page.getByRole('button', { name: "resetAndClearErrors('name')" }).click()

      // Name should be reset and its error cleared
      await expect(page.locator('input[name="name"]')).toHaveValue('Initial Name')
      await expect(page.getByText('Name error from child')).not.toBeVisible()

      // Email should still be changed and have error
      await expect(page.locator('input[name="email"]')).toHaveValue('changed@example.com')
      await expect(page.getByText('Email error from child').first()).toBeVisible()
    })

    test('can set defaults from child', async ({ page }) => {
      // Change values
      await page.locator('input[name="name"]').fill('New Default')

      // Set defaults
      await page.getByRole('button', { name: 'defaults()' }).click()

      // Should now be clean (current values are now defaults)
      await page.locator('input[name="name"]').fill('Something else')
      await page.getByRole('button', { name: 'reset()', exact: true }).click()
      await expect(page.locator('input[name="name"]')).toHaveValue('New Default')
    })

    test('can get data as object from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Test Name')
      await page.locator('input[name="email"]').fill('test@example.com')
      await page.locator('textarea[name="bio"]').fill('Test bio')

      await page.getByRole('button', { name: 'getData()' }).click()

      // Check the result is displayed
      await expect(page.getByText('Test Name')).toBeVisible()
      await expect(page.getByText('test@example.com')).toBeVisible()
      await expect(page.getByText('Test bio')).toBeVisible()
    })

    test('can get FormData from child', async ({ page }) => {
      await page.locator('input[name="name"]').fill('Test Name')
      await page.locator('input[name="email"]').fill('test@example.com')

      await page.getByRole('button', { name: 'getFormData()' }).click()

      // Check the result is displayed
      await expect(page.getByText('Test Name')).toBeVisible()
      await expect(page.getByText('test@example.com')).toBeVisible()
    })
  })

  test.describe('Multiple Forms', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context/multiple')
    })

    test('each form provides isolated context to its children', async ({ page }) => {
      // Both forms should start clean
      await expect(page.getByText('Child: Form is clean').first()).toBeVisible()
      await expect(page.getByText('Child: Form is clean').nth(1)).toBeVisible()

      // Make form 1 dirty
      await page.locator('input[name="name"]').first().fill('Changed')

      // Only form 1 should be dirty
      await expect(page.getByText('Form 1 Parent: dirty')).toBeVisible()
      await expect(page.getByText('Child: Form is dirty')).toBeVisible()
      await expect(page.getByText('Form 2 Parent: clean')).toBeVisible()
      await expect(page.getByText('Child: Form is clean')).toBeVisible()
    })

    test('setting error in one form does not affect the other', async ({ page }) => {
      // Set error in form 1 via child
      await page.getByRole('button', { name: 'Set Error' }).first().click()

      // Only form 1 should have error
      await expect(page.getByText('Error: Error from child').first()).toBeVisible()
      await expect(page.getByText('Error: Error from child')).toHaveCount(2) // Parent + Child of form 1
      await expect(page.getByText('Form 2 Parent: clean')).toBeVisible()

      // Set error in form 2 via child
      await page.getByRole('button', { name: 'Set Error' }).nth(1).click()

      // Both should have errors now (4 total: 2 per form)
      await expect(page.getByText('Error: Error from child')).toHaveCount(4)

      // Clear error in form 1
      await page.getByRole('button', { name: 'Clear Error' }).first().click()

      // Only form 2 should have errors now
      await expect(page.getByText('Error: Error from child')).toHaveCount(2)
    })
  })
})
