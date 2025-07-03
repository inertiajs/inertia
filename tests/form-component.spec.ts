import test, { expect } from '@playwright/test'
import { pageLoads, shouldBeDumpPage } from './support'

test.describe('Form Component', () => {
  test.skip(process.env.PACKAGE !== 'vue3', 'Currently only implemented for Vue 3')

  test.describe('Elements', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      page.goto('/form-component/elements')
    })

    test('can submit the form with the default values', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.files).toEqual({})
      await expect(dump.query).toEqual({})
      await expect(dump.form).toEqual({
        name: '',
        country: 'uk',
        bio: '',
        token: 'abc123',
        age: '',
        user: { address: { street: '' } },
        items: [{ name: 'Item A' }, { name: 'Item B' }],
      })
    })

    test('can submit the form with filled values', async ({ page }) => {
      await page.fill('#name', 'Joe')
      await page.selectOption('#country', 'us')
      await page.selectOption('#role', 'User')
      await page.check('input[name="plan"][value="pro"]')
      await page.check('#subscribe')
      await page.check('input[name="interests[]"][value="sports"]')
      await page.check('input[name="interests[]"][value="music"]')
      await page.selectOption('#skills', ['vue', 'react'])
      await page.setInputFiles('#avatar', {
        name: 'avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      })
      await page.setInputFiles('#documents', [
        { name: 'doc1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake pdf data 1') },
        { name: 'doc2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake pdf data 2') },
      ])
      await page.fill('#bio', 'This is a bio.')
      await page.fill('#age', '30')
      await page.fill('#nested_street', '123 Main St')
      await page.fill('#item_a', 'Item 1')
      await page.fill('#item_b', 'Item 2')

      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.query).toEqual({})
      await expect(dump.files).toEqual([
        {
          fieldname: 'avatar',
          originalname: 'avatar.jpg',
          mimetype: 'image/jpeg',
          buffer: { type: 'Buffer', data: expect.any(Array) },
          encoding: '7bit',
          size: 15,
        },
        {
          fieldname: 'documents[0]',
          originalname: 'doc1.pdf',
          mimetype: 'application/pdf',
          buffer: { type: 'Buffer', data: expect.any(Array) },
          encoding: '7bit',
          size: 15,
        },
        {
          fieldname: 'documents[1]',
          originalname: 'doc2.pdf',
          mimetype: 'application/pdf',
          buffer: { type: 'Buffer', data: expect.any(Array) },
          encoding: '7bit',
          size: 15,
        },
      ])

      await expect(dump.form).toEqual({
        name: 'Joe',
        country: 'us',
        role: 'User',
        plan: 'pro',
        subscribe: 'yes',
        interests: ['sports', 'music'],
        skills: ['vue', 'react'],
        bio: 'This is a bio.',
        token: 'abc123',
        age: '30',
        user: { address: { street: '123 Main St' } },
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
    })

    test('can check if the form is dirty', async ({ page }) => {
      await expect(page.getByText('Form is clean')).toBeVisible()
      await page.fill('#name', 'Joe')
      await expect(page.locator('#name')).toHaveValue('Joe')
      await expect(page.getByText('Form is dirty')).toBeVisible()
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(page.getByText('Form is clean')).toBeVisible()
      await expect(page.locator('#name')).toHaveValue('')
    })
  })

  test.describe('Headers', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/headers')
    })

    test('can submit the form and send default headers', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.headers).toMatchObject({
        'x-foo': 'Bar',
      })
    })

    test('can submit the form and override headers via props', async ({ page }) => {
      await page.getByRole('button', { name: 'Add Custom Header' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.headers).toMatchObject({
        'x-foo': 'Bar',
        'x-custom': 'MyCustomValue',
      })
    })
  })

  test.describe('Errors', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/errors')
    })

    test('shows no errors by default', async ({ page }) => {
      await expect(page.getByText('Form has errors')).not.toBeVisible()
      await expect(page.locator('#error_name')).toHaveText('')
      await expect(page.locator('#error_handle')).toHaveText('')
    })

    test('can set errors manually', async ({ page }) => {
      await page.getByRole('button', { name: 'Set Errors' }).click()

      await expect(page.getByText('Form has errors')).toBeVisible()
      await expect(page.locator('#error_name')).toHaveText('The name field is required.')
      await expect(page.locator('#error_handle')).toHaveText('The handle field is invalid.')
    })

    test('can clear all errors', async ({ page }) => {
      await page.getByRole('button', { name: 'Set Errors' }).click()
      await expect(page.getByText('Form has errors')).toBeVisible()

      await page.getByRole('button', { name: 'Clear Errors' }).click()

      await expect(page.getByText('Form has errors')).not.toBeVisible()
      await expect(page.locator('#error_name')).toHaveText('')
      await expect(page.locator('#error_handle')).toHaveText('')
    })

    test('can clear a specific error', async ({ page }) => {
      await page.getByRole('button', { name: 'Set Errors' }).click()
      await expect(page.getByText('Form has errors')).toBeVisible()

      await page.getByRole('button', { name: 'Clear Name Error' }).click()

      await expect(page.locator('#error_name')).toHaveText('')
      await expect(page.locator('#error_handle')).toHaveText('The handle field is invalid.')
      await expect(page.getByText('Form has errors')).toBeVisible()
    })

    test('shows server-side errors when submitting the form', async ({ page }) => {
      await page.fill('#name', 'Some Name')
      await page.fill('#handle', 'Invalid Handle')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.getByText('Form has errors')).toBeVisible()
      await expect(page.locator('#error_name')).toHaveText('Some name error')
      await expect(page.locator('#error_handle')).toHaveText('The Handle was invalid')
    })
  })

  test.describe('Events', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/events')
    })

    test('fires events in order on success', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click()

      const eventOrder = await page.locator('#events').innerText()
      expect(eventOrder.split(',')).toEqual(['onBefore', 'onCancelToken', 'onStart', 'onSuccess', 'onFinish'])
    })

    test('fires events in order on error', async ({ page }) => {
      await page.getByRole('button', { name: 'Fail Request' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const eventOrder = await page.locator('#events').innerText()
      expect(eventOrder.split(',')).toEqual(['onBefore', 'onCancelToken', 'onStart', 'onError', 'onFinish'])
    })

    test('fires only onBefore and onCancel when canceled via event cancellation', async ({ page }) => {
      await page.getByRole('button', { name: 'Cancel in onBefore' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const eventOrder = await page.locator('#events').innerText()
      expect(eventOrder.split(',')).toEqual(['onBefore', 'onCancel'])
    })

    test('fires onCancelToken and cancels the request via the token', async ({ page }) => {
      await page.getByRole('button', { name: 'Use Cancel Token' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()
      await page.getByRole('button', { name: 'Cancel Visit' }).click()

      const eventOrder = await page.locator('#events').innerText()
      expect(eventOrder.split(',')).toEqual(['onBefore', 'onCancelToken', 'onStart', 'onCancel', 'onFinish'])
    })

    test('fires onProgress during file upload', async ({ page }) => {
      const file = {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      }

      await page.setInputFiles('#avatar', file)
      await page.getByRole('button', { name: 'Submit' }).click()

      const eventOrder = await page.locator('#events').innerText()
      expect(eventOrder.split(',')).toContain('onProgress')
    })
  })
})
