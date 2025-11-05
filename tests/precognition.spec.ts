import test, { expect } from '@playwright/test'
import { requests, shouldBeDumpPage } from './support'

const integrations = ['form-helper']

integrations.forEach((integration) => {
  test.skip(process.env.PACKAGE === 'Svelte', '[WIP]')

  test.describe(integration === 'form-helper' ? 'Form Helper' : 'Form Component', () => {
    test.describe('Precognition', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/' + integration + '/precognition/default')
      })

      test('does not validate when field is untouched', async ({ page }) => {
        await page.locator('input[name="name"]').focus()
        await page.waitForTimeout(100)
        await page.locator('input[name="name"]').blur()

        for (let i = 0; i < 5; i++) {
          await expect(page.getByText('Validating...')).not.toBeVisible()
          await page.waitForTimeout(50)
        }

        await expect(page.getByText('The name field is required.')).not.toBeVisible()
      })

      test('shows validation error when field is invalid', async ({ page }) => {
        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
      })

      test('clears validation error when field becomes valid', async ({ page }) => {
        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()

        await page.fill('input[name="name"]', 'John Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).not.toBeVisible()
      })

      test('validates only the specified field', async ({ page }) => {
        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email field is required.')).not.toBeVisible()
      })

      test('validates multiple fields independently', async ({ page }) => {
        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).not.toBeVisible()

        await page.fill('input[name="email"]', 'x')
        await page.locator('input[name="email"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).toBeVisible()
      })

      test('does not clear unrelated field errors', async ({ page }) => {
        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()

        await page.fill('input[name="email"]', 'x')
        await page.locator('input[name="email"]').blur()

        await expect(page.getByText('The email must be a valid email address.')).toBeVisible()

        await page.fill('input[name="email"]', 'test@example.com')
        await page.locator('input[name="email"]').blur()

        await expect(page.getByText('The email must be a valid email address.')).not.toBeVisible()
        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
      })

      test('field is valid when validated and no errors exist', async ({ page }) => {
        await expect(page.getByText('Name is valid!')).not.toBeVisible()

        await page.fill('input[name="name"]', 'John Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('Name is valid!')).toBeVisible()
      })

      test('field is not valid before validation', async ({ page }) => {
        await expect(page.getByText('Name is valid!')).not.toBeVisible()

        await page.fill('input[name="name"]', 'John Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('Name is valid!')).toBeVisible()
        await expect(page.getByText('The name must be at least 3 characters.')).not.toBeVisible()
      })

      test('field is not valid after failed validation', async ({ page }) => {
        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('Name is valid!')).not.toBeVisible()
      })

      test('valid field persists after successful validation', async ({ page }) => {
        await page.fill('input[name="name"]', 'John Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('Name is valid!')).toBeVisible()

        await page.fill('input[name="name"]', 'Jane Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('Name is valid!')).toBeVisible()
      })

      test('valid field becomes invalid when field is revalidated with errors', async ({ page }) => {
        await page.fill('input[name="name"]', 'John Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('Name is valid!')).toBeVisible()

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('Name is valid!')).not.toBeVisible()
      })

      test('shows only first error when server returns errors as array', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/array-errors')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        // Should show only the first error from the array, not the second
        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The name contains invalid characters.')).not.toBeVisible()
      })

      test('shows all errors when simpleValidationErrors is false', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/all-errors')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        // Should show all errors from the array
        await expect(page.locator('#name-error-0')).toHaveText('The name must be at least 3 characters.')
        await expect(page.locator('#name-error-1')).toHaveText('The name contains invalid characters.')
      })

      test('validates all touched fields when calling validate() without arguments', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await page.fill('input[name="email"]', 'x')
        await page.locator('input[name="email"]').blur()

        await expect(page.getByText('Validating...')).not.toBeVisible()
        await expect(page.getByText('The name must be at least 3 characters.')).not.toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).not.toBeVisible()

        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).toBeVisible()
      })

      test('reset all fields clears all touched fields', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await page.fill('input[name="email"]', 'x')
        await page.locator('input[name="email"]').blur()

        await page.getByRole('button', { name: 'Reset All' }).click()

        await expect(page.locator('input[name="name"]')).toHaveValue('')
        await expect(page.locator('input[name="email"]')).toHaveValue('')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email field is required.')).not.toBeVisible()
      })

      test('reset specific fields removes only those fields from touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await page.fill('input[name="email"]', 'x')
        await page.locator('input[name="email"]').blur()

        await expect(page.locator('input[name="name"]')).toHaveValue('ab')
        await expect(page.locator('input[name="email"]')).toHaveValue('x')

        await page.getByRole('button', { name: 'Reset Name', exact: true }).click()

        await expect(page.locator('input[name="name"]')).toHaveValue('')
        await expect(page.locator('input[name="email"]')).toHaveValue('x')

        await page.fill('input[name="email"]', 'y')

        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name field is required.')).not.toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).toBeVisible()
      })

      test('touch with array marks multiple fields as touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.getByRole('button', { name: 'Touch Name and Email' }).click()
        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name field is required.')).toBeVisible()
        await expect(page.getByText('The email field is required.')).toBeVisible()
      })

      test('touch deduplicates fields when called multiple times', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.fill('input[name="name"]', 'ab')

        await page.getByRole('button', { name: 'Touch Name Twice' }).click()
        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).not.toBeVisible()
      })

      test('touched() returns false when no fields are touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await expect(page.locator('#any-touched')).toHaveText('Form has no touched fields')
        await expect(page.locator('#name-touched')).toHaveText('Name is not touched')
        await expect(page.locator('#email-touched')).toHaveText('Email is not touched')
      })

      test('touched(field) returns true when specific field is touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.locator('input[name="name"]').focus()
        await page.locator('input[name="name"]').blur()

        await expect(page.locator('#name-touched')).toHaveText('Name is touched')
        await expect(page.locator('#email-touched')).toHaveText('Email is not touched')
        await expect(page.locator('#any-touched')).toHaveText('Form has touched fields')
      })

      test('touched() returns true when any field is touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.locator('input[name="email"]').focus()
        await page.locator('input[name="email"]').blur()

        await expect(page.locator('#any-touched')).toHaveText('Form has touched fields')
        await expect(page.locator('#email-touched')).toHaveText('Email is touched')
        await expect(page.locator('#name-touched')).toHaveText('Name is not touched')
      })

      test('touched() updates when multiple fields are touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.locator('input[name="name"]').focus()
        await page.locator('input[name="name"]').blur()
        await page.locator('input[name="email"]').focus()
        await page.locator('input[name="email"]').blur()

        await expect(page.locator('#name-touched')).toHaveText('Name is touched')
        await expect(page.locator('#email-touched')).toHaveText('Email is touched')
        await expect(page.locator('#any-touched')).toHaveText('Form has touched fields')
      })

      test('validating a specific field also validates previously touched inputs', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.fill('input[name="name"]', 'ab')
        await page.fill('input[name="email"]', 'x')

        await page.getByRole('button', { name: 'Validate Name', exact: true }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).toBeVisible()
      })

      test('validate with array of fields validates multiple fields', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.getByRole('button', { name: 'Validate Name and Email' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name field is required.')).toBeVisible()
        await expect(page.getByText('The email field is required.')).toBeVisible()
      })

      test('reset with array removes multiple fields from touched', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/methods')

        await page.fill('input[name="name"]', 'ab')
        await page.locator('input[name="name"]').blur()

        await page.fill('input[name="email"]', 'x')
        await page.locator('input[name="email"]').blur()

        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).toBeVisible()

        await page.getByRole('button', { name: 'Reset Name and Email' }).click()

        await expect(page.locator('input[name="name"]')).toHaveValue('')
        await expect(page.locator('input[name="email"]')).toHaveValue('')

        await expect(page.getByText('Name is not touched')).toBeVisible()
        await expect(page.getByText('Email is not touched')).toBeVisible()
        await expect(page.getByText('Form has no touched fields')).toBeVisible()

        await page.fill('input[name="name"]', 'abc')
        await page.fill('input[name="email"]', 'test@example.com')

        await page.getByRole('button', { name: 'Validate All Touched' }).click()

        await page.waitForTimeout(500)

        await expect(page.getByText('The name must be at least 3 characters.')).not.toBeVisible()
        await expect(page.getByText('The email must be a valid email address.')).not.toBeVisible()
      })

      test('does not submit files by default', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/files')

        await page.setInputFiles('#avatar', {
          name: 'avatar.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
        })

        await page.getByRole('button', { name: 'Validate Both' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name field is required.')).toBeVisible()
        await expect(page.getByText('The avatar field is required.')).toBeVisible()
      })

      test('validates files when validate-files prop is true', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/files')
        await page.getByRole('button', { name: /Toggle Validate Files/ }).click()
        await expect(page.getByText('Toggle Validate Files (enabled)')).toBeVisible()

        await page.fill('input[name="name"]', 'ab')
        await page.setInputFiles('#avatar', {
          name: 'avatar.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
        })

        await page.getByRole('button', { name: 'Validate Both' }).click()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        await expect(page.getByText('The avatar field is required.')).not.toBeVisible()
      })

      test('transforms data for validation requests', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/transform')

        await page.fill('input[name="name"]', 'a')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()

        await page.fill('input[name="name"]', 'aa')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('The name must be at least 3 characters.')).not.toBeVisible()
        await expect(page.getByText('Name is valid!')).toBeVisible()
      })

      test('calls onPrecognitionSuccess and onFinish callbacks when validation succeeds', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/callbacks')

        await page.fill('input[name="name"]', 'John Doe')
        await page.click('button:has-text("Validate")')

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('onPrecognitionSuccess called!')).toBeVisible()
        await expect(page.getByText('onValidationError called!')).not.toBeVisible()
        await expect(page.getByText('onFinish called!')).toBeVisible()
      })

      test('calls onValidationError and onFinish callbacks when validation fails', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/callbacks')

        await page.fill('input[name="name"]', 'ab')
        await page.click('button:has-text("Validate")')

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        await expect(page.getByText('onPrecognitionSuccess called!')).not.toBeVisible()
        await expect(page.getByText('onValidationError called!')).toBeVisible()
        await expect(page.getByText('onFinish called!')).toBeVisible()
      })

      test('onBefore can block validation', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/before-validation')

        await page.fill('input[name="name"]', 'block')
        await page.locator('input[name="name"]').blur()

        for (let i = 0; i < 5; i++) {
          await expect(page.getByText('Validating...')).not.toBeVisible()
          await page.waitForTimeout(50)
        }
      })

      test('sends custom headers with validation requests', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/headers')

        // Fill in a valid name to trigger validation
        await page.fill('input[name="name"]', 'John Doe')
        await page.locator('input[name="name"]').blur()

        await expect(page.getByText('Validating...')).toBeVisible()
        await expect(page.getByText('Validating...')).not.toBeVisible()

        // Should show error confirming custom header was received
        await expect(page.getByText('Custom header received: custom-value')).toBeVisible()
      })

      test('automatically cancels previous validation when new validation starts', async ({ page }) => {
        await page.goto('/' + integration + '/precognition/cancel')

        requests.listenForFailed(page)
        requests.listenForResponses(page)

        await page.fill('#auto-cancel-name-input', 'ab')
        await page.locator('#auto-cancel-name-input').blur()
        await expect(page.getByText('Validating...')).toBeVisible()

        // Immediately change value and trigger new validation - should cancel the first one
        await page.fill('#auto-cancel-name-input', 'xy')
        await page.locator('#auto-cancel-name-input').blur()
        await expect(page.getByText('Validating...')).not.toBeVisible()
        await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()

        // One cancelled, one 422 response
        expect(requests.failed).toHaveLength(1)
        expect(requests.responses).toHaveLength(1)

        const cancelledRequestError = await requests.failed[0].failure()?.errorText
        expect(cancelledRequestError).toBe('net::ERR_ABORTED')
      })
    })
  })

  test.describe('Form Helper', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/' + integration + '/precognition/instantiate')
    })

    const variants = {
      default: 'withPrecognition() with strings',
      dynamic: 'withPrecognition() with callbacks',
      wayfinder: 'withPrecognition() with Wayfinder',
      dynamicWayfinder: 'withPrecognition() with a Wayfinder callback',
      legacy: 'legacy useForm() from Precognition package with strings',
      legacyDynamic: 'legacy useForm() from Precognition package with callbacks',
      legacyWayfinder: 'legacy useForm() from Precognition package with Wayfinder',
      legacyDynamicWayfinder: 'legacy useForm() from Precognition package with a Wayfinder callback',
    }

    Object.entries(variants).forEach(([key, description]) => {
      test.describe('instantiate using ' + description, () => {
        test('validates form data using the precognition endpoint', async ({ page }) => {
          await page.selectOption('select', key)
          await page.getByRole('button', { name: 'Validate' }).click()
          await expect(page.getByText('Validating...')).toBeVisible()
          await expect(page.getByText('Validating...')).not.toBeVisible()
          await expect(page.getByText('The name must be at least 3 characters.')).toBeVisible()
        })

        test('submits to the precognition endpoint when no arguments are given', async ({ page }) => {
          await page.selectOption('select', key)
          await page.getByRole('button', { name: 'Submit without args' }).click()

          await expect(page).toHaveURL('/precognition/default')

          // @ts-ignore
          const dump = await page.evaluate(() => window._inertia_request_dump)
          await expect(dump).not.toBeNull()

          await expect(dump.method).toEqual('post')
          await expect(dump.headers['precognition']).toBeUndefined()
          await expect(dump.form).toEqual({
            name: 'a',
          })
        })

        test('submits to another endpoint using method + url arguments', async ({ page }) => {
          await page.selectOption('select', key)
          await page.getByRole('button', { name: 'Submit with args' }).click()

          const dump = await shouldBeDumpPage(page, 'patch')
          await expect(dump.headers['precognition']).toBeUndefined()
          await expect(dump.form).toEqual({
            name: 'a',
          })
        })

        test('submits to another endpoint using wayfinder-shaped argument', async ({ page }) => {
          await page.selectOption('select', key)
          await page.getByRole('button', { name: 'Submit with Wayfinder' }).click()

          const dump = await shouldBeDumpPage(page, 'post')
          await expect(dump.headers['precognition']).toBeUndefined()
          await expect(dump.form).toEqual({
            name: 'a',
          })
        })

        test('submits to another endpoint using the form.[method](url) syntax', async ({ page }) => {
          await page.selectOption('select', key)
          await page.getByRole('button', { name: 'Submit with method' }).click()

          const dump = await shouldBeDumpPage(page, 'put')
          await expect(dump.headers['precognition']).toBeUndefined()
          await expect(dump.form).toEqual({
            name: 'a',
          })
        })
      })
    })
  })
})
