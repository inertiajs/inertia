import test, { expect } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Form Component Context', () => {
  test.describe('Basic Context', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context')
    })

    test('provides context to child components', async ({ page }) => {
      // Check that child component has access to form state
      await expect(page.locator('#child-state')).toBeVisible()
      await expect(page.locator('#child-state')).toContainText('Child: Form is clean')
    })

    test('provides context to deeply nested components', async ({ page }) => {
      // Check that deeply nested component has access to form state
      await expect(page.locator('#deeply-nested-state')).toBeVisible()
      await expect(page.locator('#deeply-nested-state')).toContainText('Deeply Nested: Form is clean')
    })

    test('returns undefined outside Form component', async ({ page }) => {
      // Check that component outside Form receives undefined
      await expect(page.locator('#no-context-message')).toBeVisible()
      await expect(page.locator('#no-context-message')).toContainText(
        'Correctly returns undefined when used outside a Form component',
      )
    })

    test('syncs isDirty state between parent and child', async ({ page }) => {
      // Initial state - clean
      await expect(page.locator('#parent-state')).toContainText('Parent: Form is clean')
      await expect(page.locator('#child-state')).toContainText('Child: Form is clean')

      // Make form dirty
      await page.fill('#name', 'Jane Doe')

      // Both parent and child should show dirty
      await expect(page.locator('#parent-state')).toContainText('Parent: Form is dirty')
      await expect(page.locator('#child-state')).toContainText('Child: Form is dirty')
    })

    test('can submit form from child component using context', async ({ page }) => {
      await page.fill('#name', 'Test Name')
      await page.fill('#email', 'test@example.com')

      // Submit from child component
      await page.click('#child-submit-button')

      // Should navigate to dump page
      await page.waitForURL('/dump/post')
    })

    test('can reset form from child component using context', async ({ page }) => {
      // Change the default values
      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@example.com')

      // Verify form is dirty
      await expect(page.locator('#child-state')).toContainText('Child: Form is dirty')

      // Reset from child
      await page.click('#child-reset-button')

      // Should be reset to defaults
      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@example.com')
      await expect(page.locator('#child-state')).toContainText('Child: Form is clean')
    })

    test('can set errors from child component using context', async ({ page }) => {
      // Set error from child
      await page.click('#child-set-error-button')

      // Both parent and child should show the error
      await expect(page.locator('#parent_error_name')).toContainText('Error set from child component')
      await expect(page.locator('#child_error_name')).toContainText('Error set from child component')
      await expect(page.locator('#parent-state')).toContainText('Parent: Form has errors')
      await expect(page.locator('#child-state')).toContainText('Child: Form has errors')
    })

    test('can clear errors from child component using context', async ({ page }) => {
      // First set an error
      await page.click('#child-set-error-button')
      await expect(page.locator('#child_error_name')).toBeVisible()

      // Clear errors from child
      await page.click('#child-clear-errors-button')

      // Errors should be cleared in both parent and child
      await expect(page.locator('#parent_error_name')).not.toBeVisible()
      await expect(page.locator('#child_error_name')).not.toBeVisible()
    })

    test('can set defaults from child component using context', async ({ page }) => {
      // Change values
      await page.fill('#name', 'New Default Name')
      await page.fill('#email', 'newdefault@example.com')

      // Form should be dirty
      await expect(page.locator('#child-state')).toContainText('Child: Form is dirty')

      // Set new defaults from child
      await page.click('#child-defaults-button')

      // Form should now be clean (because current values are now the defaults)
      await expect(page.locator('#child-state')).toContainText('Child: Form is clean')

      // Reset should now go back to the new defaults
      await page.fill('#name', 'Another Name')
      await expect(page.locator('#child-state')).toContainText('Child: Form is dirty')

      await page.click('#child-reset-button')
      await expect(page.locator('#name')).toHaveValue('New Default Name')
      await expect(page.locator('#email')).toHaveValue('newdefault@example.com')
    })
  })

  test.describe('Context Methods', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/context-methods')
    })

    test('child can access all state properties through context', async ({ page }) => {
      // Check initial state
      await expect(page.locator('#child-is-dirty')).toContainText('false')
      await expect(page.locator('#child-has-errors')).toContainText('false')
      await expect(page.locator('#child-processing')).toContainText('false')
      await expect(page.locator('#child-was-successful')).toContainText('false')
      await expect(page.locator('#child-recently-successful')).toContainText('false')
    })

    test('can submit from child using context', async ({ page }) => {
      await page.fill('#name', 'Test')
      await page.fill('#email', 'test@example.com')

      await page.click('#child-submit')

      await page.waitForURL('/dump/post')
    })

    test('can reset all fields from child', async ({ page }) => {
      // Change all fields
      await page.fill('#name', 'Changed')
      await page.fill('#email', 'changed@example.com')
      await page.fill('#bio', 'Changed bio')

      // Reset all
      await page.click('#child-reset-all')

      // Should be back to defaults
      await expect(page.locator('#name')).toHaveValue('Initial Name')
      await expect(page.locator('#email')).toHaveValue('initial@example.com')
      await expect(page.locator('#bio')).toHaveValue('Initial bio')
    })

    test('can reset specific field from child', async ({ page }) => {
      // Change fields
      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@example.com')

      // Reset only name
      await page.click('#child-reset-name')

      // Name should be reset, email should stay changed
      await expect(page.locator('#name')).toHaveValue('Initial Name')
      await expect(page.locator('#email')).toHaveValue('changed@example.com')
    })

    test('can reset multiple specific fields from child', async ({ page }) => {
      // Change fields
      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@example.com')
      await page.fill('#bio', 'Changed bio')

      // Reset name and email
      await page.click('#child-reset-multiple')

      // Name and email should be reset, bio should stay changed
      await expect(page.locator('#name')).toHaveValue('Initial Name')
      await expect(page.locator('#email')).toHaveValue('initial@example.com')
      await expect(page.locator('#bio')).toHaveValue('Changed bio')
    })

    test('can set single error from child', async ({ page }) => {
      await page.click('#child-set-single-error')

      // Check error appears in both parent and child
      await expect(page.locator('#parent-has-errors')).toContainText('true')
      await expect(page.locator('#child-has-errors')).toContainText('true')
      await expect(page.locator('#child-errors')).toContainText('Name is invalid')
    })

    test('can set multiple errors from child', async ({ page }) => {
      await page.click('#child-set-multiple-errors')

      // Check all errors appear
      await expect(page.locator('#child-has-errors')).toContainText('true')
      await expect(page.locator('#child-errors')).toContainText('Name error from child')
      await expect(page.locator('#child-errors')).toContainText('Email error from child')
      await expect(page.locator('#child-errors')).toContainText('Bio error from child')
    })

    test('can clear all errors from child', async ({ page }) => {
      // Set errors first
      await page.click('#child-set-multiple-errors')
      await expect(page.locator('#child-has-errors')).toContainText('true')

      // Clear all errors
      await page.click('#child-clear-all-errors')

      await expect(page.locator('#child-has-errors')).toContainText('false')
      await expect(page.locator('#child-errors')).not.toBeVisible()
    })

    test('can clear specific error from child', async ({ page }) => {
      // Set multiple errors
      await page.click('#child-set-multiple-errors')

      // Clear only name error
      await page.click('#child-clear-name-error')

      // Name error should be cleared, others should remain
      await expect(page.locator('#child-errors')).not.toContainText('Name error from child')
      await expect(page.locator('#child-errors')).toContainText('Email error from child')
      await expect(page.locator('#child-errors')).toContainText('Bio error from child')
    })

    test('can reset and clear errors together from child', async ({ page }) => {
      // Change values and set errors
      await page.fill('#name', 'Changed')
      await page.click('#child-set-single-error')
      await expect(page.locator('#child-has-errors')).toContainText('true')
      await expect(page.locator('#child-is-dirty')).toContainText('true')

      // Reset and clear errors
      await page.click('#child-reset-clear-all')

      // Both should be cleared
      await expect(page.locator('#child-has-errors')).toContainText('false')
      await expect(page.locator('#child-is-dirty')).toContainText('false')
      await expect(page.locator('#name')).toHaveValue('Initial Name')
    })

    test('can reset specific field and clear its error from child', async ({ page }) => {
      // Set errors and change values
      await page.fill('#name', 'Changed')
      await page.fill('#email', 'changed@example.com')
      await page.click('#child-set-multiple-errors')

      // Reset and clear only name
      await page.click('#child-reset-clear-name')

      // Name should be reset and its error cleared
      await expect(page.locator('#name')).toHaveValue('Initial Name')
      await expect(page.locator('#child-errors')).not.toContainText('Name error from child')

      // Email should still be changed and have error
      await expect(page.locator('#email')).toHaveValue('changed@example.com')
      await expect(page.locator('#child-errors')).toContainText('Email error from child')
    })

    test('can set defaults from child', async ({ page }) => {
      // Change values
      await page.fill('#name', 'New Default')
      await expect(page.locator('#child-is-dirty')).toContainText('true')

      // Set defaults
      await page.click('#child-set-defaults')

      // Should now be clean
      await expect(page.locator('#child-is-dirty')).toContainText('false')
    })

    test('can get data as object from child', async ({ page }) => {
      await page.fill('#name', 'Test Name')
      await page.fill('#email', 'test@example.com')
      await page.fill('#bio', 'Test bio')

      await page.click('#child-get-data')

      // Check the result is displayed
      const result = await page.locator('#get-data-result pre')
      await expect(result).toBeVisible()
      const text = await result.textContent()
      expect(text).toContain('Test Name')
      expect(text).toContain('test@example.com')
      expect(text).toContain('Test bio')
    })

    test('can get FormData from child', async ({ page }) => {
      await page.fill('#name', 'Test Name')
      await page.fill('#email', 'test@example.com')

      await page.click('#child-get-form-data')

      // Check the result is displayed
      const result = await page.locator('#get-form-data-result pre')
      await expect(result).toBeVisible()
      const text = await result.textContent()
      expect(text).toContain('Test Name')
      expect(text).toContain('test@example.com')
    })
  })
})
