import test, { expect, Page } from '@playwright/test'
import { consoleMessages, pageLoads, requests, scrollElementTo, shouldBeDumpPage } from './support'

test.describe('Form Component', () => {
  test.describe('Elements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/form-component/elements')
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

    const queryStringArrayFormats = ['brackets', 'indices', 'force-brackets']

    queryStringArrayFormats.forEach((format) => {
      test('can submit the form with filled values using ' + format + ' format', async ({ page }) => {
        test.setTimeout(10_000)

        await page.goto('/form-component/elements?queryStringArrayFormat=' + format)
        await expect(page.locator('#name')).toBeVisible()

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
            fieldname: format === 'force-brackets' ? 'documents[]' : 'documents[0]',
            originalname: 'doc1.pdf',
            mimetype: 'application/pdf',
            buffer: { type: 'Buffer', data: expect.any(Array) },
            encoding: '7bit',
            size: 15,
          },
          {
            fieldname: format === 'force-brackets' ? 'documents[]' : 'documents[1]',
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
          ...(format === 'force-brackets'
            ? { 'items[][name]': ['Item 1', 'Item 2'] }
            : { items: [{ name: 'Item 1' }, { name: 'Item 2' }] }),
        })
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

    test('keep the initial value on errors', async ({ page }) => {
      pageLoads.watch(page, 2)

      await page.goto('/form-component/default-value')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await page.fill('#name', 'Jane Doe')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#error_name')).toHaveText('The name must be at least 10 characters.')
      await expect(page.locator('#name')).toHaveValue('Jane Doe')

      await page.fill('#name', 'Jonathan Doe')
      await page.getByRole('button', { name: 'Submit' }).click()

      await page.waitForURL('/')
    })
  })

  test.describe('Reset Attributes', () => {
    test('resetOnError resets fields after error', async ({ page }) => {
      await page.goto('/form-component/reset-on-error')

      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@email.com')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#error_name')).toHaveText('Some name error')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@doe.biz')
    })

    test('resetOnError with specific fields only resets those fields', async ({ page }) => {
      await page.goto('/form-component/reset-on-error-fields')

      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@email.com')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#error_name')).toHaveText('Some name error')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('changed@email.com')
    })

    test('resetOnSuccess resets fields after success', async ({ page }) => {
      await page.goto('/form-component/reset-on-success')

      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@email.com')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@doe.biz')
    })

    test('resetOnSuccess with specific fields only resets those fields', async ({ page }) => {
      await page.goto('/form-component/reset-on-success-fields')

      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@email.com')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('changed@email.com')
    })
  })

  test.describe('Set Defaults Attributes', () => {
    test('setDefaultsOnSuccess updates defaults and clears dirty state', async ({ page }) => {
      await page.goto('/form-component/set-defaults-on-success')

      await expect(page.locator('#dirty-status')).toHaveText('Form is clean')
      await page.fill('#name', 'Jane Smith')
      await page.fill('#email', 'jane@smith.com')
      await expect(page.locator('#dirty-status')).toHaveText('Form is dirty')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#name')).toHaveValue('Jane Smith')
      await expect(page.locator('#email')).toHaveValue('jane@smith.com')
      await expect(page.locator('#dirty-status')).toHaveText('Form is clean')
    })
  })

  test.describe('Events and State', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/events')
    })

    const waitForEvents = async (page: Page, events: string[]) => {
      await page.waitForFunction(async (expected) => {
        return document.querySelector('#events')?.innerText === expected
      }, events.join(','))
    }

    test('fires events in order on success', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click()

      await waitForEvents(page, ['onBefore', 'onCancelToken', 'onStart', 'onSuccess', 'onFinish'])
    })

    test('fires events in order on error', async ({ page }) => {
      await page.getByRole('button', { name: 'Fail Request' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      await waitForEvents(page, ['onBefore', 'onCancelToken', 'onStart', 'onError', 'onFinish'])
    })

    test('fires only onBefore and onCancel when canceled via event cancellation', async ({ page }) => {
      await page.getByRole('button', { name: 'Cancel in onBefore' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()

      await waitForEvents(page, ['onBefore', 'onCancel'])
    })

    test('fires onCancelToken and cancels the request via the token', async ({ page }) => {
      await page.getByRole('button', { name: 'Should Delay' }).click()
      await page.getByRole('button', { name: 'Submit' }).click()
      await page.getByRole('button', { name: 'Cancel Visit' }).click()

      await waitForEvents(page, ['onBefore', 'onCancelToken', 'onStart', 'onCancel', 'onFinish'])
    })

    test('fires onProgress during file upload', async ({ page }) => {
      const file = {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      }

      await page.setInputFiles('#avatar', file)
      await page.getByRole('button', { name: 'Submit' }).click()

      await waitForEvents(page, ['onBefore', 'onCancelToken', 'onStart', 'onProgress'])
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
      await page.waitForURL('/article?tags[]=alpha&tags[]=beta')

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

    test('submits the form with view transitions enabled', async ({ page }) => {
      consoleMessages.listen(page)
      pageLoads.watch(page, 2)

      await page.goto('/form-component/view-transition')

      await page.getByRole('button', { name: 'Submit with View Transition' }).click()

      await expect(page).toHaveURL('/form-component/view-transition')
      await expect(page.getByText('Page B - View Transition Test')).toBeVisible()

      await expect.poll(() => consoleMessages.messages).toEqual(['updateCallbackDone', 'ready', 'finished'])
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

  test('can disable the form while processing', async ({ page }) => {
    await page.goto('/form-component/disable-while-processing/yes')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.locator('form[inert]')).toBeVisible()
    await expect(page.locator('form[inert]')).not.toBeVisible()
  })

  test('will not disable the form while processing by default', async ({ page }) => {
    await page.goto('/form-component/disable-while-processing/no')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForTimeout(250)
    await expect(page.locator('form[inert]')).not.toBeVisible()
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

  test.describe('OnSubmitComplete callbacks', () => {
    test('reset', async ({ page }) => {
      await page.goto('/form-component/submit-complete/reset')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@doe.biz')

      await page.fill('#name', 'John Who')
      await page.fill('#email', 'john@who.biz')

      requests.listen(page)

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(requests.requests).toHaveLength(1)

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@who.biz')
    })

    test('defaults', async ({ page }) => {
      await page.goto('/form-component/submit-complete/defaults')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@doe.biz')

      await expect(page.locator('#dirty-status')).toHaveText('Form is clean')

      await page.fill('#name', 'Jane Smith')
      await page.fill('#email', 'jane@smith.com')

      await expect(page.locator('#dirty-status')).toHaveText('Form is dirty')

      requests.listen(page)

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(requests.requests).toHaveLength(1)

      // After submit with defaults(), the current values should become the new defaults
      // Values should remain changed (not reset)
      await expect(page.locator('#name')).toHaveValue('Jane Smith')
      await expect(page.locator('#email')).toHaveValue('jane@smith.com')

      // Most importantly: form should no longer be dirty after calling defaults()
      await expect(page.locator('#dirty-status')).toHaveText('Form is clean')
    })

    test('redirect and reset', async ({ page }) => {
      page.on('pageerror', (msg) => {
        throw new Error(msg.message)
      })

      await page.goto('/form-component/submit-complete/redirect')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await page.fill('#name', 'John Who')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.locator('#name')).not.toBeVisible()
    })
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

    test('can set current form data as defaults via ref', async ({ page }) => {
      await page.goto('/form-component/ref')

      // Modify form fields
      await page.fill('input[name="name"]', 'New Name')
      await page.fill('input[name="email"]', 'new@example.com')

      // Form should be dirty
      await expect(page.getByText('Form is dirty')).toBeVisible()

      // Set current values as defaults
      await page.click('button:has-text("Set Current as Defaults")')

      // Form should no longer be dirty
      await expect(page.getByText('Form is clean')).toBeVisible()

      // Reset form should now use the new defaults
      await page.fill('input[name="name"]', 'Modified Again')
      await page.click('button:has-text("Reset Form")')

      expect(await page.inputValue('input[name="name"]')).toBe('New Name')
      expect(await page.inputValue('input[name="email"]')).toBe('new@example.com')
    })

    test('the precognition methods are available via ref', async ({ page }) => {
      await page.goto('/form-component/ref')
      requests.listen(page)

      await page.click('button:has-text("Call Precognition Methods")')

      await page.waitForTimeout(500) // Wait for request to be made

      await expect(requests.requests).toHaveLength(1)

      const request = requests.requests[0]

      expect(request.method()).toBe('POST')
      expect(request.headers()['precognition']).toBe('true')
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

  test.describe('Reset', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/reset')
    })

    const countFiles = async (page, selector: string) => {
      return await page.evaluate((sel) => {
        const input = document.querySelector(sel) as HTMLInputElement
        return input.files?.length || 0
      }, selector)
    }

    const getSelectedOptions = async (page, selector: string) => {
      return await page.evaluate((sel) => {
        const select = document.querySelector(sel) as HTMLSelectElement
        return Array.from(select.selectedOptions).map((opt) => opt.value)
      }, selector)
    }

    const resetForm = async (page, fields?: string[]) => {
      // @ts-ignore
      return await page.evaluate((fields) => (fields ? window.resetForm(...fields) : window.resetForm()), fields)
    }

    test('resets all fields to their default values', async ({ page }) => {
      // Change all field values
      await page.fill('#name', 'Jane Smith')
      await page.fill('#email', 'jane@test.com')
      await page.selectOption('#country', 'us')
      await page.selectOption('#role', 'admin')
      await page.check('#plan_free')
      await page.check('#payment_card')
      await page.uncheck('#subscribe')
      await page.check('#terms')
      await page.uncheck('#interests_sports')
      await page.check('#interests_music')
      await page.uncheck('#interests_tech')
      await page.check('#interests_art')
      await page.selectOption('#skills', ['react', 'svelte'])
      await page.fill('#bio', 'New bio text')
      await page.fill('#notes', 'Some notes')
      await page.fill('#age', '30')
      await page.fill('#quantity', '15')
      await page.fill('#volume', '75')
      await page.fill('#birthdate', '2000-12-31')
      await page.fill('#appointment', '09:00')
      await page.fill('#favorite_color', '#00ff00')
      await page.fill('#website', 'https://newsite.com')
      await page.fill('#phone', '+9876543210')
      await page.fill('#password', 'newpass456')
      await page.fill('#nested_street', '456 Oak Ave')
      await page.fill('#nested_city', 'Los Angeles')
      await page.fill('#item_0_name', 'Item C')
      await page.fill('#item_0_quantity', '20')
      await page.fill('#item_1_name', 'Item D')
      await page.fill('#item_1_quantity', '30')

      await resetForm(page)

      // Verify all fields are reset to defaults
      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@example.com')
      await expect(page.locator('#country')).toHaveValue('uk')
      await expect(page.locator('#role')).toHaveValue('')
      await expect(page.locator('#plan_pro')).toBeChecked()
      await expect(page.locator('#plan_free')).not.toBeChecked()
      await expect(page.locator('#payment_card')).not.toBeChecked()
      await expect(page.locator('#payment_bank')).not.toBeChecked()
      await expect(page.locator('#payment_paypal')).not.toBeChecked()
      await expect(page.locator('#subscribe')).toBeChecked()
      await expect(page.locator('#terms')).not.toBeChecked()
      await expect(page.locator('#interests_sports')).toBeChecked()
      await expect(page.locator('#interests_music')).not.toBeChecked()
      await expect(page.locator('#interests_tech')).toBeChecked()
      await expect(page.locator('#interests_art')).not.toBeChecked()

      // Check multi-select (need to get selected options)
      const selectedSkills = await getSelectedOptions(page, '#skills')
      expect(selectedSkills).toEqual(['vue', 'angular'])

      await expect(page.locator('#bio')).toHaveValue('Default bio text here.')
      await expect(page.locator('#notes')).toHaveValue('')
      await expect(page.locator('#age')).toHaveValue('25')
      await expect(page.locator('#quantity')).toHaveValue('')
      await expect(page.locator('#volume')).toHaveValue('50')
      await expect(page.locator('#birthdate')).toHaveValue('1990-01-01')
      await expect(page.locator('#appointment')).toHaveValue('14:30')
      await expect(page.locator('#favorite_color')).toHaveValue('#ff0000')
      await expect(page.locator('#website')).toHaveValue('https://example.com')
      await expect(page.locator('#phone')).toHaveValue('+1234567890')
      await expect(page.locator('#password')).toHaveValue('secret123')
      await expect(page.locator('#nested_street')).toHaveValue('123 Main St')
      await expect(page.locator('#nested_city')).toHaveValue('New York')
      await expect(page.locator('#item_0_name')).toHaveValue('Item A')
      await expect(page.locator('#item_0_quantity')).toHaveValue('5')
      await expect(page.locator('#item_1_name')).toHaveValue('Item B')
      await expect(page.locator('#item_1_quantity')).toHaveValue('10')
      await expect(page.locator('#token')).toHaveValue('abc123')

      // Verify disabled field is not affected
      await expect(page.locator('#disabled_field')).toHaveValue('Ignore me')
    })

    test('resets specific fields only', async ({ page }) => {
      // Change multiple field values
      await page.fill('#name', 'Jane Smith')
      await page.fill('#email', 'jane@test.com')
      await page.selectOption('#country', 'us')
      await page.fill('#bio', 'New bio')
      await page.fill('#age', '30')

      // Reset only name and bio
      await resetForm(page, ['name', 'bio'])

      // Verify only specified fields are reset
      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#bio')).toHaveValue('Default bio text here.')

      // Verify other fields are not reset
      await expect(page.locator('#email')).toHaveValue('jane@test.com')
      await expect(page.locator('#country')).toHaveValue('us')
      await expect(page.locator('#age')).toHaveValue('30')
    })

    test('resets file inputs to empty', async ({ page }) => {
      // Add files to file inputs
      await page.setInputFiles('#avatar', {
        name: 'avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      })

      await page.setInputFiles('#documents', [
        { name: 'doc1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake pdf data 1') },
        { name: 'doc2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake pdf data 2') },
      ])

      // Verify files are set
      expect(await countFiles(page, '#avatar')).toBe(1)
      expect(await countFiles(page, '#documents')).toBe(2)

      await resetForm(page)

      // Verify file inputs are cleared
      expect(await countFiles(page, '#avatar')).toBe(0)
      expect(await countFiles(page, '#documents')).toBe(0)
    })

    test('does not affect button inputs', async ({ page }) => {
      // Get initial button values
      const buttonValue = await page.locator('input[name="button_input"]').inputValue()
      const submitValue = await page.locator('input[name="submit_input"]').inputValue()
      const resetValue = await page.locator('input[name="reset_input"]').inputValue()

      await resetForm(page)

      // Verify button values are unchanged
      await expect(page.locator('input[name="button_input"]')).toHaveValue(buttonValue)
      await expect(page.locator('input[name="submit_input"]')).toHaveValue(submitValue)
      await expect(page.locator('input[name="reset_input"]')).toHaveValue(resetValue)
    })

    test('disabled fields reset behavior', async ({ page }) => {
      // Get initial value of the disabled field
      const initialValue = await page.locator('#disabled_field').inputValue()
      expect(initialValue).toBe('Ignore me')

      // Change the disabled field value using JavaScript
      await page.evaluate(() => {
        const input = document.querySelector('#disabled_field') as HTMLInputElement
        input.value = 'Changed Value'
      })

      // Verify the disabled field value is changed
      await expect(page.locator('#disabled_field')).toHaveValue('Changed Value')

      await page.fill('#name', 'Test Name')
      await page.fill('#email', 'test@test.com')

      // Partial reset - disabled fields use their DOM defaultValue
      await resetForm(page, ['disabled_field', 'name', 'email'])

      // Disabled field is reset using its defaultValue
      await expect(page.locator('#disabled_field')).toHaveValue('Ignore me')
      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@example.com')

      await page.fill('#name', 'Test Name Again')

      // Change disabled field again to test full reset
      await page.evaluate(() => {
        const input = document.querySelector('#disabled_field') as HTMLInputElement
        input.value = 'Changed Again'
      })

      // Full reset - uses browser's native reset() which resets all fields including disabled
      await resetForm(page)

      // Both partial and full reset now work consistently for disabled fields
      await expect(page.locator('#disabled_field')).toHaveValue('Ignore me')
      await expect(page.locator('#name')).toHaveValue('John Doe')
    })

    test('resets fields with dotted notation names', async ({ page }) => {
      await page.fill('#user_name', 'Changed User')
      await page.fill('#user_email', 'changed@user.com')
      await page.fill('#company_name', 'Changed Corp')

      await resetForm(page)

      await expect(page.locator('#user_name')).toHaveValue('Default User')
      await expect(page.locator('#user_email')).toHaveValue('user@default.com')
      await expect(page.locator('#company_name')).toHaveValue('Default Corp')
    })

    test('resets array fields with same name', async ({ page }) => {
      await page.fill('#tag_0', 'php')
      await page.fill('#tag_1', 'laravel')
      await page.fill('#tag_2', 'symfony')

      await resetForm(page)

      await expect(page.locator('#tag_0')).toHaveValue('javascript')
      await expect(page.locator('#tag_1')).toHaveValue('vue')
      await expect(page.locator('#tag_2')).toHaveValue('inertia')
    })

    test('edge cases - non-existent fields and dynamic fields', async ({ page }) => {
      // Scenario 1: Handles non-existent field names gracefully
      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@email.com')

      // Reset with non-existent field names mixed with real ones
      await resetForm(page, ['nonExistentField', 'name', 'anotherFakeField'])

      // Verify real field was reset, others unchanged
      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('changed@email.com')

      // Scenario 2: Reset works with dynamically added fields
      await page.evaluate(() => {
        const form = document.querySelector('form')
        const newInput = document.createElement('input')
        newInput.type = 'text'
        newInput.name = 'dynamic_field'
        newInput.id = 'dynamic_field'
        newInput.value = 'initial value'
        form?.appendChild(newInput)
      })

      // Change the dynamic field
      await page.fill('#dynamic_field', 'changed value')

      // Reset should handle it (though it won't have a default in FormData)
      await resetForm(page)

      // Dynamic field should be empty (no default was captured)
      await expect(page.locator('#dynamic_field')).toHaveValue('')

      // Other fields should reset normally
      await expect(page.locator('#name')).toHaveValue('John Doe')
    })

    test('can reset form using reset-type input element', async ({ page }) => {
      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@example.com')

      await expect(page.locator('#name')).toHaveValue('Changed Name')
      await expect(page.locator('#email')).toHaveValue('changed@example.com')

      await page.click('input[name="reset_input"]')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@example.com')
    })

    test('can reset form using reset-type button element', async ({ page }) => {
      await page.fill('#name', 'Changed Name')
      await page.fill('#email', 'changed@example.com')

      await expect(page.locator('#name')).toHaveValue('Changed Name')
      await expect(page.locator('#email')).toHaveValue('changed@example.com')

      await page.click('button[name="reset_button"]')

      await expect(page.locator('#name')).toHaveValue('John Doe')
      await expect(page.locator('#email')).toHaveValue('john@example.com')
    })

    test('multi-select reset behavior comprehensive test', async ({ page }) => {
      // Multi-select with no defaults resets to empty
      await page.selectOption('#languages', ['javascript', 'python'])
      const beforeLanguageReset = await getSelectedOptions(page, '#languages')
      expect(beforeLanguageReset).toEqual(['javascript', 'python'])

      await resetForm(page, ['languages[]'])
      const afterLanguageReset = await getSelectedOptions(page, '#languages')
      expect(afterLanguageReset).toEqual([])

      // Multi-select with all options selected resets correctly
      await page.selectOption('#tools', ['vscode']) // Select only one
      const beforeToolsReset = await getSelectedOptions(page, '#tools')
      expect(beforeToolsReset).toEqual(['vscode'])

      await resetForm(page, ['tools[]'])
      const afterToolsReset = await getSelectedOptions(page, '#tools')
      expect(afterToolsReset.sort()).toEqual(['sublime', 'vscode', 'webstorm'])

      // Single select vs multi-select behavior differs correctly
      await page.selectOption('#editor', 'emacs')
      await page.selectOption('#skills', ['react'])

      await resetForm(page, ['editor', 'skills[]'])

      await expect(page.locator('#editor')).toHaveValue('vim')
      const skillsSelected = await getSelectedOptions(page, '#skills')
      expect(skillsSelected.sort()).toEqual(['angular', 'vue'])

      // Partial reset preserves other multi-selects
      await page.selectOption('#skills', ['react', 'svelte'])
      await page.selectOption('#languages', ['javascript', 'typescript'])
      await page.selectOption('#tools', ['vscode'])

      await resetForm(page, ['skills[]'])

      const skillsAfterPartialReset = await getSelectedOptions(page, '#skills')
      expect(skillsAfterPartialReset.sort()).toEqual(['angular', 'vue'])

      const languagesAfterPartialReset = await getSelectedOptions(page, '#languages')
      expect(languagesAfterPartialReset).toEqual(['javascript', 'typescript'])

      const toolsAfterPartialReset = await getSelectedOptions(page, '#tools')
      expect(toolsAfterPartialReset).toEqual(['vscode'])

      // Edge cases with invalid selections
      await page.evaluate(() => {
        const select = document.querySelector('#skills') as HTMLSelectElement
        Array.from(select.options).forEach((opt) => (opt.selected = false))
        select.value = 'nonexistent'
      })

      await resetForm(page, ['skills[]'])
      const skillsAfterEdgeCase = await getSelectedOptions(page, '#skills')
      expect(skillsAfterEdgeCase.sort()).toEqual(['angular', 'vue'])

      // Verify detailed option states (bug fix verification)
      await page.selectOption('#skills', ['react', 'svelte'])
      await resetForm(page, ['skills[]'])

      const detailedOptions = await page.evaluate(() => {
        const select = document.querySelector('#skills') as HTMLSelectElement
        return {
          selectedValues: Array.from(select.selectedOptions)
            .map((opt) => opt.value)
            .sort(),
          allValues: Array.from(select.options).map((opt) => ({ value: opt.value, selected: opt.selected })),
        }
      })

      expect(detailedOptions.selectedValues).toEqual(['angular', 'vue'])
      expect(detailedOptions.allValues).toEqual([
        { value: 'vue', selected: true },
        { value: 'react', selected: false },
        { value: 'angular', selected: true },
        { value: 'svelte', selected: false },
      ])
    })

    test('numeric field reset behavior - full and selective', async ({ page }) => {
      // Scenario 1: Full reset of numeric fields
      await page.check('#rating_3')
      await page.uncheck('#years_2020')
      await page.uncheck('#years_2022')
      await page.check('#years_2021')
      await page.selectOption('#version', '2')
      await page.selectOption('#ports', ['8080'])

      // Verify fields were changed
      await expect(page.locator('#rating_3')).toBeChecked()
      await expect(page.locator('#years_2021')).toBeChecked()
      await expect(page.locator('#years_2020')).not.toBeChecked()
      await expect(page.locator('#years_2022')).not.toBeChecked()
      await expect(page.locator('#version')).toHaveValue('2')
      const selectedPorts = await getSelectedOptions(page, '#ports')
      expect(selectedPorts).toEqual(['8080'])

      await resetForm(page)

      // Verify numeric fields are reset to defaults
      await expect(page.locator('#rating_1')).toBeChecked()
      await expect(page.locator('#rating_2')).not.toBeChecked()
      await expect(page.locator('#rating_3')).not.toBeChecked()
      await expect(page.locator('#years_2020')).toBeChecked()
      await expect(page.locator('#years_2021')).not.toBeChecked()
      await expect(page.locator('#years_2022')).toBeChecked()
      await expect(page.locator('#version')).toHaveValue('1')
      const resetPorts = await getSelectedOptions(page, '#ports')
      expect(resetPorts.sort()).toEqual(['443', '80'])

      // Scenario 2: Selective reset of numeric fields
      await page.check('#rating_2')
      await page.uncheck('#years_2020')
      await page.check('#years_2021')
      await page.selectOption('#version', '3')
      await page.selectOption('#ports', ['8080'])

      // Reset only rating and version fields
      await resetForm(page, ['rating', 'version'])

      // Verify only specified numeric fields are reset
      await expect(page.locator('#rating_1')).toBeChecked()
      await expect(page.locator('#rating_2')).not.toBeChecked()
      await expect(page.locator('#version')).toHaveValue('1')

      // Other fields should maintain changed values
      await expect(page.locator('#years_2020')).not.toBeChecked()
      await expect(page.locator('#years_2021')).toBeChecked()
      await expect(page.locator('#years_2022')).toBeChecked() // This stays as original default
      const unchangedPorts = await getSelectedOptions(page, '#ports')
      expect(unchangedPorts).toEqual(['8080'])
    })
  })

  test('it accepts wayfinder shaped objects as action', async ({ page }) => {
    await page.goto('/form-component/wayfinder')

    const form = page.locator('form')
    await expect(form).toHaveAttribute('action', '/dump/post')
    await expect(form).toHaveAttribute('method', 'post')

    await page.getByRole('button', { name: 'Submit' }).click()

    const dump = await shouldBeDumpPage(page, 'post')
    expect(dump.method).toEqual('post')
    expect(dump.form).toEqual({
      name: 'John Doe',
      active: 'true',
    })
  })

  const cacheTagsPropTypes = ['string', 'array']

  cacheTagsPropTypes.forEach((propType) => {
    test(`invalidate prefetch cache using tags (using ${propType})`, async ({ page }) => {
      await page.goto('/form-component/invalidate-tags/' + propType)

      // Prefetch both pages
      const prefetchUser = page.waitForResponse('/prefetch/tags/1')
      await page.getByRole('link', { name: 'User Tagged Page' }).hover()
      await prefetchUser

      const prefetchProduct = page.waitForResponse('/prefetch/tags/2')
      await page.getByRole('link', { name: 'Product Tagged Page' }).hover()
      await prefetchProduct

      // Submit form that invalidates 'user' tag
      await page.fill('#form-name', 'Test User')
      await page.click('#submit-invalidate-user')
      await shouldBeDumpPage(page, 'post')

      await page.goBack()

      // User-tagged page should be invalidated and refetched
      requests.listen(page)
      await page.getByRole('link', { name: 'User Tagged Page' }).click()
      await expect(requests.requests.length).toBeGreaterThanOrEqual(1)
      await expect(page).toHaveURL('/prefetch/tags/1')

      // Go back and check product page is still cached
      await page.goBack()
      requests.listen(page)
      await page.getByRole('link', { name: 'Product Tagged Page' }).click()
      await expect(requests.requests.length).toBe(0)
    })
  })

  test.describe('React', () => {
    test.skip(process.env.PACKAGE !== 'react', 'Skipping React-specific tests')

    test('it preserves the internal state of child components', async ({ page }) => {
      await page.goto('/form-component/child-component')

      await expect(page.getByText('Form is clean')).toBeVisible()

      await page.fill('#child', 'a')
      await expect(page.locator('#child')).toHaveValue('A')
      await expect(page.getByText('Form is dirty')).toBeVisible()

      await page.getByRole('button', { name: 'Submit' }).click()
      const dump = await shouldBeDumpPage(page, 'post')
      expect(dump.form).toEqual({ child: 'A' })
    })
  })

  test.describe('getData and getFormData methods', () => {
    test.beforeEach(async ({ page }) => {
      consoleMessages.listen(page)
      await page.goto('/form-component/data-methods')
    })

    test('getData returns form data as object', async ({ page }) => {
      await page.fill('#name', 'John Doe')
      await page.getByRole('button', { name: 'Test getData()' }).click()

      const result = consoleMessages.messages.find((msg) => msg.includes('getData result:'))
      expect(result).toBe('getData result: {name: John Doe}')
    })

    test('getFormData returns FormData instance', async ({ page }) => {
      await page.fill('#name', 'Jane Doe')
      await page.getByRole('button', { name: 'Test getFormData()' }).click()

      const formDataMessage = consoleMessages.messages.find((msg) => msg.includes('getFormData entries:'))
      expect(formDataMessage).toBe('getFormData entries: {name: Jane Doe}')
    })
  })

  test.describe('Mixed Key Serialization', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/form-component/mixed-key-serialization')
    })

    test('submits form with mixed numeric and string keys as objects', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).first().click()

      const dump = await shouldBeDumpPage(page, 'post')

      expect(Array.isArray(dump.form.fields?.entries)).toBe(false)
      expect(typeof dump.form.fields?.entries).toBe('object')

      const entryKeys = Object.keys(dump.form.fields.entries)
      expect(entryKeys).toEqual(['100', 'new:1'])

      expect(dump.form.fields.entries['100']).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      })

      expect(dump.form.fields.entries['new:1']).toEqual({
        name: 'Jane Smith',
        email: 'jane@example.com',
      })
    })
  })

  test.describe('Submit Button', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/form-component/submit-button')
    })

    test('includes submit button name and value in form data', async ({ page }) => {
      await page.click('#save-button')
      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.form).toEqual({
        name: 'John Doe',
        action: 'save',
      })
    })

    test('includes different button value when clicking different submit button', async ({ page }) => {
      await page.click('#draft-button')
      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.form).toEqual({
        name: 'John Doe',
        action: 'draft',
      })
    })

    test('does not include action when button has no name', async ({ page }) => {
      await page.click('#no-name-button')
      const dump = await shouldBeDumpPage(page, 'post')

      expect(dump.form).toEqual({
        name: 'John Doe',
      })
    })
  })
})
