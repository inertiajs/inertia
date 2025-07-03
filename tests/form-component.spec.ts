import test, { expect } from '@playwright/test'
import { pageLoads, requests, scrollElementTo, shouldBeDumpPage } from './support'

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

  test.describe('Events and State', () => {
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
      await page.getByRole('button', { name: 'Should Delay' }).click()
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

    test('updates processing during request', async ({ page }) => {
      await page.getByRole('button', { name: 'Should Delay' }).click()
      await expect(page.locator('#processing')).toHaveText('false')
      await page.getByRole('button', { name: 'Submit' }).click()
      await expect(page.locator('#processing')).toHaveText('true')
      await page.waitForSelector('#processing:has-text("false")')
    })

    test('shows progress during file upload', async ({ page }) => {
      const file = {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      }

      await page.getByRole('button', { name: 'Should Delay' }).click()
      await page.setInputFiles('#avatar', file)
      await page.getByRole('button', { name: 'Submit' }).click()

      // Wait for #progress not being 0
      await page.waitForSelector('#progress.uploading')

      const percentage = parseInt(await page.locator('#progress').innerText())
      expect(percentage).toBeLessThanOrEqual(100)
    })

    test('updates wasSuccessful and recentlySuccessful after success', async ({ page }) => {
      await expect(page.locator('#was-successful')).toHaveText('false')
      await expect(page.locator('#recently-successful')).toHaveText('false')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#was-successful')).toHaveText('true')
      await expect(page.locator('#recently-successful')).toHaveText('true')

      await page.waitForTimeout(2500)

      await expect(page.locator('#recently-successful')).toHaveText('false')
    })
  })

  test.describe('Form Options', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/options')
    })

    test('submits the form and requests only the users prop', async ({ page }) => {
      await page.getByRole('button', { name: 'Set Only (users)' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.headers).toMatchObject({
        'x-inertia-partial-data': 'users',
        'x-inertia-partial-component': 'FormComponent/Options',
      })
    })

    test('submits the form and excludes the stats prop from the response', async ({ page }) => {
      await page.getByRole('button', { name: 'Set Except (stats)' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.headers).toMatchObject({
        'x-inertia-partial-except': 'stats',
        'x-inertia-partial-component': 'FormComponent/Options',
      })
    })

    test('submits the form and encodes arrays using brackets format', async ({ page }) => {
      await page.getByRole('button', { name: 'Use Brackets Format' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const dump = await shouldBeDumpPage(page, 'get')

      expect(dump.url).toEqual(expect.stringContaining('/dump/get?tags[]=alpha&tags[]=beta'))
    })

    test('submits the form and encodes arrays using indices format', async ({ page }) => {
      await page.getByRole('button', { name: 'Use Indices Format' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const dump = await shouldBeDumpPage(page, 'get')

      expect(dump.url).toEqual(expect.stringContaining('/dump/get?tags[0]=alpha&tags[1]=beta'))
    })

    test('replaces the browser history when replace is enabled', async ({ page }) => {
      // Add some history...
      await page.goto('/article')
      await page.goto('/form-component/options')

      await page.getByRole('button', { name: 'Enable Replace' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      await shouldBeDumpPage(page, 'post')

      await page.goBack()
      await expect(page).toHaveURL('/article')
    })

    test('preserves the scroll position when preserveScroll is enabled', async ({ page }) => {
      await page.getByRole('button', { name: 'Enable Preserve Scroll' }).click()
      await scrollElementTo(
        page,
        page.evaluate(() => window.scrollTo(0, 100)),
      )

      const scrollBefore = await page.evaluate(() => window.scrollY)
      expect(scrollBefore).toBeGreaterThan(0)

      await page.getByRole('button', { name: 'Submit' }).click()
      await page.waitForURL('/article')

      const scrollAfter = await page.evaluate(() => window.scrollY)
      // TODO: why is this not exactly 100?
      expect(scrollAfter).toBeGreaterThan(90)
    })

    test('preserves the form state when preserveState is enabled', async ({ page }) => {
      requests.listen(page)

      await expect(requests.requests).toHaveLength(0)

      expect(await page.locator('#state').innerText()).toEqual('Default State')
      await page.getByRole('button', { name: 'Enable Preserve State' }).click()
      expect(await page.locator('#state').innerText()).toEqual('Replaced State')
      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(requests.requests).toHaveLength(1)
      expect(await page.locator('#state').innerText()).toEqual('Replaced State')
    })
  })
})
