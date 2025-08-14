import test, { expect } from '@playwright/test'
import { pageLoads, requests, scrollElementTo, shouldBeDumpPage } from './support'

test.describe('Form Component', () => {
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

    test('shows server-side errors when submitting the form with an error bag', async ({ page }) => {
      await page.fill('#name', 'Some Name')
      await page.fill('#handle', 'Invalid Handle')

      await page.getByRole('button', { name: 'Use Error Bag' }).click()
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

    test('submits the form and resets the orders prop from the response', async ({ page }) => {
      await page.getByRole('button', { name: 'Set Reset (orders)' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.headers).toMatchObject({
        'x-inertia-partial-data': 'orders',
        'x-inertia-partial-component': 'FormComponent/Options',
        'x-inertia-reset': 'orders',
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

    test('preserves the URL when preserveUrl is enabled', async ({ page }) => {
      requests.listen(page)

      await expect(requests.requests).toHaveLength(0)

      await page.getByRole('button', { name: 'Enable Preserve Url' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(requests.requests).toHaveLength(1)
      await expect(page).toHaveURL('form-component/options')
    })
  })

  test.describe('Progress', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/progress')
      requests.listen(page)
      requests.listenForFinished(page)
      await expect(requests.requests).toHaveLength(0)
      await expect(page.locator('#nprogress-appearances')).toHaveText('0')
    })

    test('shows progress during a normal request', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click()
      await expect(requests.requests).toHaveLength(1)
      await expect(page.locator('#nprogress-appearances')).toHaveText('1')
    })

    test('does not show progress when showProgress is false', async ({ page }) => {
      await page.getByRole('button', { name: 'Disable Progress' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      await expect.poll(() => requests.finished.length).toBe(1)

      await expect(page.locator('#nprogress-appearances')).toHaveText('0')
    })
  })

  test('replaces the browser history when replace is enabled', async ({ page }) => {
    await page.goto('/article')
    await page.goto('/form-component/options')

    await page.getByRole('button', { name: 'Enable Replace' }).click()
    await page.getByRole('button', { name: 'Submit' }).click()

    await shouldBeDumpPage(page, 'post')

    await page.goBack()
    await expect(page).toHaveURL('/article')
  })

  test('submit without an action attribute uses the current URL', async ({ page }) => {
    await page.goto('/form-component/url/with/segements')
    await expect(page.locator('#error_name')).not.toBeVisible()

    requests.listen(page)

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.locator('#error_name')).toHaveText('Something went wrong')

    await expect(requests.requests).toHaveLength(1)
    const request = requests.requests[0]

    expect(request.method()).toBe('POST')
    expect(request.url().includes('/form-component/url/with/segements')).toBe(true)

    await expect(page).toHaveURL('/form-component/url/with/segements')
  })

  test.describe('Methods', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/form-component/methods')
    })

    test('submits GET request with query parameters', async ({ page }) => {
      await page.getByRole('button', { name: 'GET', exact: true }).click()
      await page.getByRole('button', { name: 'Submit GET' }).click()

      const dump = await shouldBeDumpPage(page, 'get')

      await expect(dump.method).toEqual('get')
      await expect(dump.query).toEqual({
        name: 'John Doe',
        active: 'true',
      })
    })

    test('submits POST request with form data', async ({ page }) => {
      await page.getByRole('button', { name: 'POST' }).click()
      await page.getByRole('button', { name: 'Submit POST' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.form).toEqual({
        name: 'John Doe',
        active: 'true',
      })
    })

    test('submits PUT request with form data', async ({ page }) => {
      await page.getByRole('button', { name: 'PUT' }).click()
      await page.getByRole('button', { name: 'Submit PUT' }).click()

      const dump = await shouldBeDumpPage(page, 'put')

      await expect(dump.method).toEqual('put')
      await expect(dump.form).toEqual({
        name: 'John Doe',
        active: 'true',
      })
    })

    test('submits PATCH request with form data', async ({ page }) => {
      await page.getByRole('button', { name: 'PATCH' }).click()
      await page.getByRole('button', { name: 'Submit PATCH' }).click()

      const dump = await shouldBeDumpPage(page, 'patch')

      await expect(dump.method).toEqual('patch')
      await expect(dump.form).toEqual({
        name: 'John Doe',
        active: 'true',
      })
    })

    test('submits DELETE request with form data', async ({ page }) => {
      await page.getByRole('button', { name: 'DELETE' }).click()
      await page.getByRole('button', { name: 'Submit DELETE' }).click()

      const dump = await shouldBeDumpPage(page, 'delete')

      await expect(dump.method).toEqual('delete')
      await expect(dump.form).toEqual({
        name: 'John Doe',
        active: 'true',
      })
    })
  })

  test.describe('Transform', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/form-component/transform')
    })

    test('submits data without transformation when transform is none', async ({ page }) => {
      await page.getByRole('button', { name: 'None' }).click()
      await page.getByRole('button', { name: 'Submit with Transform' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.form).toEqual({
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
      })
    })

    test('transforms data to uppercase when uppercase transform is selected', async ({ page }) => {
      await page.getByRole('button', { name: 'Uppercase' }).click()
      await page.getByRole('button', { name: 'Submit with Transform' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.form).toEqual({
        name: 'JOHN DOE',
        firstName: 'John',
        lastName: 'Doe',
      })
    })

    test('formats data when format transform is selected', async ({ page }) => {
      await page.getByRole('button', { name: 'Format' }).click()
      await page.getByRole('button', { name: 'Submit with Transform' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.form).toEqual({
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      })
    })

    test('transforms update input data correctly', async ({ page }) => {
      await page.fill('input[name="name"]', 'jane smith')
      await page.fill('input[name="firstName"]', 'jane')
      await page.fill('input[name="lastName"]', 'smith')
      await page.getByRole('button', { name: 'Uppercase' }).click()
      await page.getByRole('button', { name: 'Submit with Transform' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.form).toEqual({
        name: 'JANE SMITH',
        firstName: 'jane',
        lastName: 'smith',
      })
    })

    test('format transform adds fullName from updated firstName and lastName', async ({ page }) => {
      await page.fill('input[name="firstName"]', 'Jane')
      await page.fill('input[name="lastName"]', 'Smith')
      await page.getByRole('button', { name: 'Format' }).click()
      await page.getByRole('button', { name: 'Submit with Transform' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.form.fullName).toEqual('Jane Smith')
    })
  })

  test.describe('Dotted Keys', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/dotted-keys')
    })

    test('transforms basic and nested dotted keys into nested objects', async ({ page }) => {
      await page.fill('input[name="user.name"]', 'John Doe')
      await page.fill('input[name="user.profile.city"]', 'Paris')
      await page.locator('input[name="user.skills[]"]').nth(0).fill('JavaScript')
      await page.locator('input[name="user.skills[]"]').nth(1).fill('Python')
      await page.fill('input[name="company.address.street"]', '123 Tech Ave')
      await page.getByRole('button', { name: 'Submit Basic' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.method).toEqual('post')
      expect(dump.form).toEqual({
        user: {
          name: 'John Doe',
          profile: {
            city: 'Paris',
          },
          skills: ['JavaScript', 'Python'],
        },
        company: {
          address: {
            street: '123 Tech Ave',
          },
        },
      })
    })

    test('handles escaped dots as literal keys', async ({ page }) => {
      await page.fill('input[name="config\\\\.app\\\\.name"]', 'My App')
      await page.fill('input[name="settings.theme\\\\.mode"]', 'dark')
      await page.getByRole('button', { name: 'Submit Escaped' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.method).toEqual('post')
      expect(dump.form).toEqual({
        'config.app.name': 'My App',
        settings: {
          'theme.mode': 'dark',
        },
      })
    })

    test('handles mixed bracket and dotted notation correctly', async ({ page }) => {
      await page.fill('input[name="settings.ui.theme"]', 'light')
      await page.getByRole('button', { name: 'Submit Mixed' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.method).toEqual('post')
      expect(dump.form).toEqual({
        user: {
          roles: ['admin', 'editor'],
        },
        settings: {
          ui: {
            theme: 'light',
          },
        },
      })
    })
  })

  test.describe('Ref', () => {
    test('can submit form programmatically using ref', async ({ page }) => {
      await page.goto('/form-component/ref')

      await page.getByRole('button', { name: 'Submit Programmatically' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.method).toEqual('post')
      expect(dump.form).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      })
    })

    test('can access errors and hasErrors via ref', async ({ page }) => {
      await page.goto('/form-component/ref')

      await expect(page.getByText('Form has errors')).not.toBeVisible()
      await expect(page.locator('#error_name')).not.toBeVisible()

      await page.getByRole('button', { name: 'Set Test Error' }).click()

      await expect(page.getByText('Form has errors')).toBeVisible()
      await expect(page.locator('#error_name')).toHaveText('This is a test error')
    })

    test('can check isDirty state via ref', async ({ page }) => {
      await page.goto('/form-component/ref')

      await expect(page.getByText('Form is clean')).toBeVisible()

      await page.fill('input[name="name"]', 'Modified Name')

      await expect(page.getByText('Form is dirty')).toBeVisible()
    })

    test('can reset form via ref', async ({ page }) => {
      await page.goto('/form-component/ref')

      await page.fill('input[name="name"]', 'Modified Name')
      await page.fill('input[name="email"]', 'modified@example.com')

      expect(await page.inputValue('input[name="name"]')).toBe('Modified Name')
      expect(await page.inputValue('input[name="email"]')).toBe('modified@example.com')

      await page.click('button:has-text("Reset Form")')

      expect(await page.inputValue('input[name="name"]')).toBe('John Doe')
      expect(await page.inputValue('input[name="email"]')).toBe('john@example.com')
    })

    test('can reset particular form fields via ref', async ({ page }) => {
      await page.goto('/form-component/ref')

      await page.fill('input[name="name"]', 'Modified Name')
      await page.fill('input[name="email"]', 'modified@example.com')

      expect(await page.inputValue('input[name="name"]')).toBe('Modified Name')
      expect(await page.inputValue('input[name="email"]')).toBe('modified@example.com')

      await page.click('button:has-text("Reset Name Field")')

      expect(await page.inputValue('input[name="name"]')).toBe('John Doe')
      expect(await page.inputValue('input[name="email"]')).toBe('modified@example.com')
    })
  })

  test.describe('Uppercase Methods', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/form-component/uppercase-method')
    })

    test('accepts uppercase POST method', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit POST' }).click()

      const dump = await shouldBeDumpPage(page, 'post')

      await expect(dump.method).toEqual('post')
      await expect(dump.form).toEqual({
        name: 'Test POST',
      })
    })

    test('accepts uppercase GET method', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit GET' }).click()

      const dump = await shouldBeDumpPage(page, 'get')

      await expect(dump.method).toEqual('get')
      await expect(dump.query).toEqual({
        query: 'Test GET',
      })
    })

    test('accepts uppercase PUT method', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit PUT' }).click()

      const dump = await shouldBeDumpPage(page, 'put')

      await expect(dump.method).toEqual('put')
      await expect(dump.form).toEqual({
        data: 'Test PUT',
      })
    })
  })
})
