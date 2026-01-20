import test, { expect } from '@playwright/test'
import { shouldBeDumpPage } from './support'

test.describe('Remember (local state caching)', () => {
  test('does not remember anything as of default', async ({ page }) => {
    await page.goto('remember/default')

    await page.fill('#name', 'A')
    await page.check('#remember')
    await page.fill('#untracked', 'B')

    await page.getByRole('link', { name: 'Navigate away' }).click()

    await shouldBeDumpPage(page, 'get')

    await page.goBack()

    await expect(page).toHaveURL('remember/default')

    await expect(page.locator('#name')).toHaveValue('')
    await expect(page.locator('#remember')).not.toBeChecked()
    await expect(page.locator('#untracked')).toHaveValue('')
  })

  test('remembers tracked fields using the object syntax', async ({ page }) => {
    await page.goto('remember/object')

    await page.fill('#name', 'A')
    await page.check('#remember')
    await page.fill('#untracked', 'B')

    await page.getByRole('link', { name: 'Navigate away' }).click()

    await shouldBeDumpPage(page, 'get')

    await page.goBack()

    await expect(page).toHaveURL('remember/object')

    await expect(page.locator('#name')).toHaveValue('A')
    await expect(page.locator('#remember')).toBeChecked()
    await expect(page.locator('#untracked')).toHaveValue('')

    // Try again with updated values
    await page.fill('#name', 'C')
    await page.uncheck('#remember')
    await page.getByRole('link', { name: 'Navigate away' }).click()

    await shouldBeDumpPage(page, 'get')

    await page.goBack()

    await expect(page).toHaveURL('remember/object')
    await expect(page.locator('#name')).toHaveValue('C')
    await expect(page.locator('#remember')).not.toBeChecked()
  })

  test('restores remembered data when pressing the back button', async ({ page }) => {
    await page.goto('remember/multiple-components')

    await page.fill('#name', 'D')
    await page.check('#remember')
    await page.fill('#untracked', 'C')

    await page.fill('.a-name', 'A1')
    await page.fill('.a-untracked', 'A2')

    await page.fill('.b-name', 'B1')
    await page.check('.b-remember')
    await page.fill('.b-untracked', 'B2')

    await page.getByRole('link', { name: 'Navigate away' }).click()

    await shouldBeDumpPage(page, 'get')

    await page.goBack()

    await expect(page).toHaveURL('remember/multiple-components')

    await expect(page.locator('#name')).toHaveValue('D')
    await expect(page.locator('#remember')).toBeChecked()
    await expect(page.locator('#untracked')).toHaveValue('')
    await expect(page.locator('.a-name')).toHaveValue('A1')
    await expect(page.locator('.a-remember')).not.toBeChecked()
    await expect(page.locator('.a-untracked')).toHaveValue('')
    await expect(page.locator('.b-name')).toHaveValue('B1')
    await expect(page.locator('.b-remember')).toBeChecked()
    await expect(page.locator('.b-untracked')).toHaveValue('')

    // Try again with updated values
    await page.fill('#name', 'E')
    await page.uncheck('#remember')

    await page.getByRole('link', { name: 'Navigate away' }).click()

    await shouldBeDumpPage(page, 'get')

    await page.goBack()

    await expect(page).toHaveURL('remember/multiple-components')
    await expect(page.locator('#name')).toHaveValue('E')
    await expect(page.locator('#remember')).not.toBeChecked()
  })

  test('restores remembered data when pressing the back button from another website', async ({ page }) => {
    await page.goto('remember/multiple-components')

    await page.fill('#name', 'D')
    await page.check('#remember')
    await page.fill('#untracked', 'C')

    await page.fill('.a-name', 'A1')
    await page.fill('.a-untracked', 'A2')

    await page.fill('.b-name', 'B1')
    await page.check('.b-remember')
    await page.fill('.b-untracked', 'B2')

    await page.getByRole('link', { name: 'Navigate off-site' }).click()

    await expect(page).toHaveURL('non-inertia')

    await page.goBack()

    await page.waitForURL('remember/multiple-components')

    await expect(page.locator('#name')).toHaveValue('D')
    await expect(page.locator('#remember')).toBeChecked()
    // This is seems to be browser dependent? Sometimes it's empty, sometimes it's the last value
    // await expect(page.locator('#untracked')).toHaveValue('')

    // Component "A" uses a string-style key (key: 'Users/Create')
    await expect(page.locator('.a-name')).toHaveValue('A1')
    await expect(page.locator('.a-remember')).not.toBeChecked()
    // This is seems to be browser dependent? Sometimes it's empty, sometimes it's the last value
    // await expect(page.locator('.a-untracked')).toHaveValue('')

    // Component "B" uses a callback-style key (key: () => `Users/Edit:${this.user.id}`)
    await expect(page.locator('.b-name')).toHaveValue('B1')
    await expect(page.locator('.b-remember')).toBeChecked()
    // This is seems to be browser dependent? Sometimes it's empty, sometimes it's the last value
    // await expect(page.locator('.b-untracked')).toHaveValue('')

    // Try again with updated values
    await page.fill('#name', 'E')
    await page.uncheck('#remember')

    await page.getByRole('link', { name: 'Navigate off-site' }).click()

    await expect(page).toHaveURL('non-inertia')

    await page.goBack()

    await page.waitForURL('remember/multiple-components')
    await expect(page.locator('#name')).toHaveValue('E')
    await expect(page.locator('#remember')).not.toBeChecked()
    // This is seems to be browser dependent? Sometimes it's empty, sometimes it's the last value
    // await expect(page.locator('#untracked')).toHaveValue('')
  })

  test('does not restore remembered data after browser refresh', async ({ page }) => {
    await page.goto('remember/object')

    await page.fill('#name', 'RefreshTest')
    await page.check('#remember')
    await page.fill('#untracked', 'ShouldNotRemember')

    await page.getByRole('link', { name: 'Navigate away' }).click()
    await shouldBeDumpPage(page, 'get')

    await page.goBack()
    await expect(page).toHaveURL('remember/object')
    await expect(page.locator('#name')).toHaveValue('RefreshTest')
    await expect(page.locator('#remember')).toBeChecked()
    await expect(page.locator('#untracked')).toHaveValue('')

    await page.reload()

    // After refresh, fields should be empty (not restored from remember state)
    await expect(page.locator('#name')).toHaveValue('')
    await expect(page.locator('#remember')).not.toBeChecked()
    await expect(page.locator('#untracked')).toHaveValue('')
  })

  test.describe('form helper', () => {
    test('does not remember form data as of default', async ({ page }) => {
      await page.goto('remember/form-helper/default')

      await page.fill('#name', 'A')
      await page.fill('#handle', 'B')
      await page.check('#remember')
      await page.fill('#untracked', 'C')

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/default')

      await expect(page.locator('#name')).not.toHaveValue('A')
      await expect(page.locator('#handle')).not.toHaveValue('B')
      await expect(page.locator('#remember')).not.toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('C')
    })

    test('does not remember form errors as of default', async ({ page }) => {
      await page.goto('remember/form-helper/default')

      await page.fill('#name', 'A')
      await page.fill('#handle', 'B')
      await page.check('#remember')
      await page.fill('#untracked', 'C')

      await page.waitForSelector('.name_error', { state: 'detached' })
      await page.waitForSelector('.handle_error', { state: 'detached' })
      await page.waitForSelector('.remember_error', { state: 'detached' })

      await page.getByRole('button', { name: 'Submit form' }).click()

      await expect(page.getByText('Some name error')).toBeVisible()
      await expect(page.getByText('The Handle was invalid')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/default')

      await expect(page.locator('#name')).not.toHaveValue('A')
      await expect(page.locator('#handle')).not.toHaveValue('B')
      await expect(page.locator('#remember')).not.toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('C')
      await expect(page.locator('.name_error')).not.toBeVisible()
      await expect(page.locator('.handle_error')).not.toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()
    })

    test('remembers form data when tracked', async ({ page }) => {
      await page.goto('remember/form-helper/remember')

      await page.fill('#name', 'A')
      await page.fill('#handle', 'B')
      await page.check('#remember')
      await page.fill('#untracked', 'C')

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/remember')

      await expect(page.locator('#name')).toHaveValue('A')
      await expect(page.locator('#handle')).toHaveValue('B')
      await expect(page.locator('#remember')).toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('C')

      // Try again with updated values
      await page.fill('#name', 'D')
      await page.fill('#handle', 'E')
      await page.uncheck('#remember')
      await page.fill('#untracked', 'F')

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/remember')

      await expect(page.locator('#name')).toHaveValue('D')
      await expect(page.locator('#handle')).toHaveValue('E')
      await expect(page.locator('#remember')).not.toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('F')
    })

    test('remembers form errors when tracked', async ({ page }) => {
      await page.goto('remember/form-helper/remember')

      await page.fill('#name', 'A')
      await page.fill('#handle', 'B')
      await page.check('#remember')
      await page.fill('#untracked', 'C')
      await page.waitForSelector('.name_error', { state: 'detached' })
      await page.waitForSelector('.handle_error', { state: 'detached' })
      await page.waitForSelector('.remember_error', { state: 'detached' })

      await page.getByRole('button', { name: 'Submit form' }).click()

      await expect(page.getByText('Some name error')).toBeVisible()
      await expect(page.getByText('The Handle was invalid')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/remember')

      await expect(page.locator('#name')).toHaveValue('A')
      await expect(page.locator('#handle')).toHaveValue('B')
      await expect(page.locator('#remember')).toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('C')
      await expect(page.locator('.name_error')).toBeVisible()
      await expect(page.locator('.handle_error')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()

      // Try again with updated values
      await page.fill('#name', 'D')
      await page.fill('#handle', 'E')
      await page.uncheck('#remember')
      await page.fill('#untracked', 'F')

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/remember')

      await expect(page.locator('#name')).toHaveValue('D')
      await expect(page.locator('#handle')).toHaveValue('E')
      await expect(page.locator('#remember')).not.toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('F')
      await expect(page.locator('.name_error')).toBeVisible()
      await expect(page.locator('.handle_error')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()
    })

    test('remembers the last state of a form when tracked', async ({ page }) => {
      await page.goto('remember/form-helper/remember')

      await page.fill('#name', 'A')
      await page.fill('#handle', 'B')
      await page.check('#remember')
      await page.fill('#untracked', 'C')
      await page.waitForSelector('.name_error', { state: 'detached' })
      await page.waitForSelector('.handle_error', { state: 'detached' })
      await page.waitForSelector('.remember_error', { state: 'detached' })

      await page.getByRole('button', { name: 'Submit form' }).click()

      await expect(page.locator('#name')).toHaveValue('A')
      await expect(page.locator('#handle')).toHaveValue('B')
      await expect(page.locator('#remember')).toBeChecked()
      await expect(page.locator('#untracked')).toHaveValue('C')

      await expect(page.getByText('Some name error')).toBeVisible()
      await expect(page.getByText('The Handle was invalid')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()

      await page.getByRole('button', { name: 'Reset one field & error' }).click()

      await expect(page.locator('#name')).toHaveValue('A')
      await expect(page.locator('#handle')).toHaveValue('example')
      await expect(page.locator('#remember')).toBeChecked()
      await expect(page.locator('#untracked')).toHaveValue('C')

      await expect(page.locator('.name_error')).not.toBeVisible()
      await expect(page.locator('.handle_error')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/remember')

      await expect(page.locator('#name')).toHaveValue('A')
      await expect(page.locator('#handle')).toHaveValue('example')
      await expect(page.locator('#remember')).toBeChecked()
      await expect(page.locator('#untracked')).not.toHaveValue('C') // Untracked, so now reset (page state was lost)
      await expect(page.locator('.name_error')).not.toBeVisible()
      await expect(page.locator('.handle_error')).toBeVisible()
      await expect(page.locator('.remember_error')).not.toBeVisible()
    })

    test('it excludes fields via dontRemember', async ({ page }) => {
      await page.goto('remember/form-helper/password')

      await page.fill('#username', 'A')
      await page.fill('#password', 'B')

      await page.getByRole('link', { name: 'Navigate away' }).click()

      await shouldBeDumpPage(page, 'get')

      await page.goBack()

      await expect(page).toHaveURL('remember/form-helper/password')

      await expect(page.locator('#username')).toHaveValue('A')
      await expect(page.locator('#password')).toHaveValue('')
    })
  })

  test('restore without types', async ({ page }) => {
    await page.goto('remember/router')

    await expect(page.getByText('Foo: -')).toBeVisible()
    await expect(page.getByText('Bar: 0')).toBeVisible()

    await page.getByRole('button', { name: 'Remember' }).click()
    await page.waitForTimeout(100) // Wait for remember to complete
    await page.getByRole('button', { name: 'Restore', exact: true }).click()

    await expect(page.getByText('Foo: foo')).toBeVisible()
    await expect(page.getByText('Bar: 42')).toBeVisible()
  })

  test('restore with types', async ({ page }) => {
    await page.goto('remember/router')

    await expect(page.getByText('Foo: -')).toBeVisible()
    await expect(page.getByText('Bar: 0')).toBeVisible()

    await page.getByRole('button', { name: 'Remember' }).click()
    await page.waitForTimeout(100) // Wait for remember to complete
    await page.getByRole('button', { name: 'Restore Typed' }).click()

    await expect(page.getByText('Foo: foo')).toBeVisible()
    await expect(page.getByText('Bar: 42')).toBeVisible()
  })
})
