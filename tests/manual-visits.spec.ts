import test, { expect } from '@playwright/test'
import {
  clickAndWaitForResponse,
  consoleMessages,
  pageLoads,
  requests,
  scrollElementTo,
  shouldBeDumpPage,
} from './support'

test('visits a different page', async ({ page }) => {
  pageLoads.watch(page)
  await page.goto('/')
  await page.getByRole('link', { name: 'Manual basic visits' }).click()
  await expect(page).toHaveURL('visits/method')
  await expect(page.getByText('This is the page that demonstrates manual visit methods')).toBeVisible()
})

test('can make a location visit', async ({ page }) => {
  test.skip(process.env.PACKAGE === 'svelte', 'Skipping for now until we diagnose')

  pageLoads.watch(page, 2)
  await page.goto('/visits/location')
  await clickAndWaitForResponse(page, 'Location visit', 'dump/get')
  await page.waitForLoadState('networkidle')
  await expect(pageLoads.count).toBe(2)

  const dump = await shouldBeDumpPage(page, 'get')

  await expect(dump.headers).not.toHaveProperty('x-inertia')
})

test.describe('Auto-cancellation', () => {
  test('will automatically cancel a pending visits when a new request is made', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/automatic-cancellation')

    consoleMessages.listen(page)

    await page.getByRole('link', { name: 'Link' }).click()
    await page.getByRole('link', { name: 'Link' }).click()

    await expect(consoleMessages.messages).toHaveLength(3)

    await expect(consoleMessages.messages[0]).toBe('started')
    await expect(consoleMessages.messages[1]).toBe('cancelled')
    await expect(consoleMessages.messages[2]).toBe('started')
  })
})

test.describe('Method', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/method')
  })

  test('can use the visit method without any options to make a GET request', async ({ page }) => {
    await page.getByRole('link', { name: 'Standard visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.method).toBe('get')
    await expect(dump.query).toEqual({})
    await expect(dump.form).toEqual({})
  })

  test('can use the visit method with a specific "method" option to manually set the request method', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Specific visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'patch')

    await expect(dump.method).toBe('patch')
    await expect(dump.query).toEqual({})
    await expect(dump.form).toEqual({})
  })

  const data = [
    { method: 'get', label: 'GET' },
    { method: 'post', label: 'POST' },
    { method: 'put', label: 'PUT' },
    { method: 'patch', label: 'PATCH' },
    { method: 'delete', label: 'DELETE' },
  ] as const

  data.forEach(({ method, label }) => {
    test(`can use the ${label} method`, async ({ page }) => {
      await page.getByRole('link', { name: `${label} Link` }).click()

      const dump = await shouldBeDumpPage(page, method)

      await expect(dump.method).toBe(method)
      await expect(dump.query).toEqual({})
      await expect(dump.form).toEqual({})
    })
  })
})

test.describe('Data', () => {
  test.describe('plain objects', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/visits/data/object')
      //   cy.intercept('/dump/**').as('spy')
    })

    test('passes data as params by default when using the visit method', async ({ page }) => {
      await page.getByRole('link', { name: 'Visit Link' }).click()

      // TODO: Should the url actually be /dump/get?foo=visit
      const dump = await shouldBeDumpPage(page, 'get')

      await expect(dump.method).toBe('get')
      await expect(dump.query).toEqual({ foo: 'visit' })
      await expect(dump.form).toEqual({})
      await expect(dump.files).toEqual({})
      await expect(dump.headers['content-type']).not.toBe('application/json')
    })

    test.describe('GET method', () => {
      test('passes data as params', async ({ page }) => {
        await page.getByRole('link', { name: 'GET Link' }).click()

        const dump = await shouldBeDumpPage(page, 'get')

        await expect(dump.method).toBe('get')
        await expect(dump.query).toEqual({ bar: 'get' })
        await expect(dump.form).toEqual({})
        await expect(dump.files).toEqual({})
        await expect(dump.headers['content-type']).not.toBe('application/json')
      })

      const data = [
        { label: 'QSAF Brackets', formatter: 'brackets', expected: '?a[]=b&a[]=c' },
        { label: 'QSAF Indices', formatter: 'indices', expected: '?a[0]=b&a[1]=c' },
        { label: 'QSAF Default', formatter: 'default', expected: '?a[]=b&a[]=c' },
      ]

      data.forEach(({ label, formatter, expected }) => {
        test(`can use the ${formatter} query string array formatter`, async ({ page }) => {
          await page.getByRole('link', { name: label }).click()

          const dump = await shouldBeDumpPage(page, 'get')

          // TODO: Should this be in the query string? It's not, but... should it be?

          await expect(dump.query).toEqual({ a: ['b', 'c'] })
          await expect(dump.method).toBe('get')
          await expect(dump.form).toEqual({})
          await expect(dump.headers['content-type']).not.toBe('application/json')
        })
      })
    })

    const data = [
      { method: 'post', label: 'POST', form: { baz: 'post' } },
      { method: 'put', label: 'PUT', form: { foo: 'put' } },
      { method: 'patch', label: 'PATCH', form: { bar: 'patch' } },
      { method: 'delete', label: 'DELETE', form: { baz: 'delete' } },
    ] as const

    data.forEach(({ method, label, form }) => {
      test(`can pass data using the ${label} method`, async ({ page }) => {
        await page.getByRole('link', { name: `${label} Link` }).click()

        const dump = await shouldBeDumpPage(page, method)

        await expect(dump.method).toBe(method)
        await expect(dump.form).toEqual(form)
        await expect(dump.files).toEqual({})
        await expect(dump.headers['content-type']).toBe('application/json')
      })
    })
  })

  test.describe('FormData objects', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/visits/data/form-data')
    })

    const data = [
      { method: 'post', label: 'Visit', form: { foo: 'visit' } },
      { method: 'post', label: 'POST', form: { baz: 'post' } },
      { method: 'put', label: 'PUT', form: { foo: 'put' } },
      { method: 'patch', label: 'PATCH', form: { bar: 'patch' } },
      { method: 'delete', label: 'DELETE', form: { baz: 'delete' } },
    ] as const

    data.forEach(({ method, label, form }) => {
      test(`can pass data using the ${label} method`, async ({ page }) => {
        await page.getByRole('link', { name: `${label} Link` }).click()

        const dump = await shouldBeDumpPage(page, method)

        await expect(dump.method).toBe(method)
        await expect(dump.form).toEqual(form)
        await expect(dump.files).toEqual([])
        await expect(dump.headers['content-type']).toContain('multipart/form-data; boundary=')
      })
    })
  })

  test.describe('auto-converted objects (when files are present)', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/visits/data/auto-converted')
    })

    const data = [
      { method: 'post', label: 'POST' },
      { method: 'put', label: 'PUT' },
      { method: 'patch', label: 'PATCH' },
      { method: 'delete', label: 'DELETE' },
    ] as const

    data.forEach(({ method, label }) => {
      test(`auto-converts objects using the ${label} method`, async ({ page }) => {
        await page.getByRole('link', { name: `${label} Link` }).click()

        const dump = await shouldBeDumpPage(page, method)

        await expect(dump.method).toBe(method)
        await expect(dump.form).toEqual({ foo: 'bar' })
        await expect(dump.files).not.toEqual([])
        await expect(dump.files[0].originalname).toBe('example.jpg')
        await expect(dump.headers['content-type']).toContain('multipart/form-data; boundary=')
      })
    })
  })
})

test.describe('Headers', () => {
  test('has the default set of headers', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/headers')

    await page.getByRole('link', { name: 'Standard visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.headers['x-inertia']).toBe('true')
    await expect(dump.headers['x-inertia-version']).toBeUndefined()
    await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
    await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
  })

  test('starts using the x-inertia-version header when a version was given from the back-end', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/headers/version')

    await page.getByRole('link', { name: 'Standard visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.headers['x-inertia-version']).toBe('example-version-header')
  })

  test('allows to set custom headers using the visit method', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/headers')

    await page.getByRole('link', { name: 'Specific visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.headers['x-inertia']).toBe('true')
    await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
    await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
    await expect(dump.headers['foo']).toBe('bar')
  })

  const data = [
    { method: 'post', label: 'POST', headerKey: 'baz', headerValue: 'foo' },
    { method: 'put', label: 'PUT', headerKey: 'foo', headerValue: 'bar' },
    { method: 'patch', label: 'PATCH', headerKey: 'bar', headerValue: 'baz' },
    { method: 'delete', label: 'DELETE', headerKey: 'baz', headerValue: 'foo' },
  ] as const

  data.forEach(({ method, label, headerKey, headerValue }) => {
    test(`allows to set custom headers using the ${label} method`, async ({ page }) => {
      pageLoads.watch(page)
      await page.goto('/visits/headers')

      await page.getByRole('link', { exact: true, name: `${label} Link` }).click()

      const dump = await shouldBeDumpPage(page, method)

      await expect(dump.headers['x-inertia']).toBe('true')
      await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
      await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
      await expect(dump.headers[headerKey]).toBe(headerValue)
    })
  })

  test('cannot override built-in Inertia headers', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/headers')

    await page.getByRole('link', { exact: true, name: 'Overriden Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.headers['x-inertia']).toBe('true')
    await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
    await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
    await expect(dump.headers['bar']).toBe('baz')
  })
})

test.describe('Replace', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/')
    await page.getByRole('link', { name: "Manual 'Replace' visits" }).click()
    await expect(page).toHaveURL('visits/replace')
  })

  const data = [{ method: 'visit' }, { method: 'GET' }] as const

  data.forEach(({ method }) => {
    // TODO: Not working...
    test(`replaces the current history state (${method} method)`, async ({ page }) => {
      await page.getByRole('link', { name: `[State] Replace ${method}: true` }).click()
      await shouldBeDumpPage(page, 'get')

      await page.goBack()
      await expect(page).toHaveURL('/')

      await page.goForward()
      await expect(page).toHaveURL('/dump/get')
    })
  })

  data.forEach(({ method }) => {
    test(`does not replace the current history state when it is set to false (${method} method)`, async ({ page }) => {
      await page.getByRole('link', { name: `[State] Replace ${method}: false` }).click()
      await shouldBeDumpPage(page, 'get')

      await page.goBack()
      await expect(page).toHaveURL('visits/replace')

      await page.goForward()
      await expect(page).toHaveURL('dump/get')
    })
  })
})

test.describe('Preserve state', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('visits/preserve-state')
  })

  const preserveData = [
    {
      testLabel: 'visit method',
      label: '[State] Preserve visit: true',
      expected: 'bar',
    },
    {
      testLabel: 'GET method',
      label: '[State] Preserve GET: true',
      expected: 'get-bar',
    },
    {
      testLabel: 'callback',
      label: '[State] Preserve Callback: true',
      expected: 'callback-bar',
    },
  ] as const

  preserveData.forEach(({ testLabel, label, expected }) => {
    test(`preserves the page's local state (${testLabel})`, async ({ page }) => {
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await page.getByLabel('Example Field').fill('Example value')

      const componentKey = await page.evaluate(() => (window as any)._inertia_page_key)
      await expect(componentKey).not.toBeUndefined()

      await page.getByRole('link', { name: label }).click()
      await expect(page).toHaveURL('/visits/preserve-state-page-two')

      const newComponentKey = await page.evaluate(() => (window as any)._inertia_page_key)
      await expect(newComponentKey).not.toBeUndefined()

      await expect(newComponentKey).toBe(componentKey)
      await expect(page.getByLabel('Example Field')).toHaveValue('Example value')
      await expect(page.getByText(`Foo is now ${expected}`)).toBeVisible()
    })
  })

  const dontPreserveData = [
    {
      testLabel: 'visit method',
      label: '[State] Preserve visit: false',
      expected: 'baz',
    },
    {
      testLabel: 'GET method',
      label: '[State] Preserve GET: false',
      expected: 'get-baz',
    },
    {
      testLabel: 'callback',
      label: '[State] Preserve Callback: false',
      expected: 'callback-baz',
    },
  ] as const

  dontPreserveData.forEach(({ testLabel, label, expected }) => {
    test(`does not preserve the page's local state (${testLabel})`, async ({ page }) => {
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await page.getByLabel('Example Field').fill('Another Value')

      const componentKey = await page.evaluate(() => (window as any)._inertia_page_key)
      await expect(componentKey).not.toBeUndefined()

      await page.getByRole('link', { name: label }).click()
      await expect(page).toHaveURL('/visits/preserve-state-page-two')

      const newComponentKey = await page.evaluate(() => (window as any)._inertia_page_key)
      await expect(newComponentKey).not.toBeUndefined()

      await expect(newComponentKey).not.toBe(componentKey)
      await expect(page.getByLabel('Example Field')).toHaveValue('')
      await expect(page.getByText(`Foo is now ${expected}`)).toBeVisible()
    })
  })
})

test.describe('Preserve scroll', () => {
  test.describe('disabled (default)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/visits/preserve-scroll-false')
      await expect(page.getByText('Foo is now default')).toBeVisible()

      await scrollElementTo(
        page,
        page.evaluate(() => window.scrollTo(5, 7)),
      )
      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(10, 15)),
      )
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('does not reset untracked scroll regions in persistent layouts (visit method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Reset Scroll' }).click()
      await expect(page).toHaveURL('/visits/preserve-scroll-false-page-two')
      await expect(page.getByText('Foo is now bar')).toBeVisible()
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('does not reset untracked scroll regions in persistent layouts (GET method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Reset Scroll (GET)' }).click()
      await expect(page).toHaveURL('/visits/preserve-scroll-false-page-two')
      await expect(page.getByText('Foo is now baz')).toBeVisible()
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('does not reset untracked scroll regions in persistent layouts when returning false from a preserveScroll callback', async ({
      page,
    }) => {
      consoleMessages.listen(page)

      await page
        .getByRole('link', { exact: true, name: 'Reset Scroll (Callback)' })
        .click({ position: { x: 20, y: 0 } })
      await expect(page).toHaveURL('/visits/preserve-scroll-false-page-two')
      await expect(page.getByText('Foo is now foo')).toBeVisible()
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()

      await expect(consoleMessages.messages).toHaveLength(1)

      const message = JSON.parse(consoleMessages.messages[0])

      await expect(message.component).not.toBeUndefined()
      await expect(message.props).not.toBeUndefined()
      await expect(message.url).not.toBeUndefined()
      await expect(message.version).not.toBeUndefined()
    })

    test('does not restore untracked scroll regions when pressing the back button (visit method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Reset Scroll' }).click()

      await expect(page).toHaveURL('/visits/preserve-scroll-false-page-two')
      await expect(page.getByText('Foo is now bar')).toBeVisible()

      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
      )
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll-false')
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
    })

    test('does not restore untracked scroll regions when pressing the back button (GET method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Reset Scroll (GET)' }).click()

      await expect(page).toHaveURL('/visits/preserve-scroll-false-page-two')
      await expect(page.getByText('Foo is now baz')).toBeVisible()

      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
      )
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll-false')
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
    })

    test('does not restore untracked scroll regions when returning true from a preserveScroll callback', async ({
      page,
    }) => {
      consoleMessages.listen(page)

      await page.getByRole('link', { name: 'Preserve Scroll (Callback)' }).click({ position: { x: 0, y: 0 } })

      await expect(page).toHaveURL('/visits/preserve-scroll-false-page-two')
      await expect(page.getByText('Foo is now baz')).toBeVisible()

      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
      )
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

      const message = JSON.parse(consoleMessages.messages[0])

      await expect(message.component).not.toBeUndefined()
      await expect(message.props).not.toBeUndefined()
      await expect(message.url).not.toBeUndefined()
      await expect(message.version).not.toBeUndefined()

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll-false')
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
    })

    test('does not restore untracked scroll regions when pressing the back button from another website', async ({
      page,
    }) => {
      await page.getByRole('link', { name: 'Off-site link' }).click()

      await expect(page).toHaveURL('non-inertia')

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll-false')
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
    })
  })

  test.describe('enabled', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/visits/preserve-scroll')
      await expect(page.getByText('Foo is now default')).toBeVisible()

      await scrollElementTo(
        page,
        page.evaluate(() => window.scrollTo(5, 7)),
      )
      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(10, 15)),
      )
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('resets scroll regions to the top when doing a regular visit (visit method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Reset Scroll' }).click()
      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')
      await expect(page.getByText('Foo is now bar')).toBeVisible()
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
    })

    test('resets scroll regions to the top when doing a regular visit (GET method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Reset Scroll (GET)' }).click()
      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')
      await expect(page.getByText('Foo is now baz')).toBeVisible()
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
    })

    test('resets scroll regions to the top when returning false from a preserveScroll callback', async ({ page }) => {
      consoleMessages.listen(page)
      await page
        .getByRole('link', { exact: true, name: 'Reset Scroll (Callback)' })
        .click({ position: { x: 20, y: 0 } })

      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')
      await expect(page.getByText('Foo is now foo')).toBeVisible()
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

      await expect(consoleMessages.messages).toHaveLength(1)
      const message = JSON.parse(consoleMessages.messages[0])

      await expect(message.component).not.toBeUndefined()
      await expect(message.props).not.toBeUndefined()
      await expect(message.url).not.toBeUndefined()
      await expect(message.version).not.toBeUndefined()
    })

    test('preserves scroll regions when using the "preserve-scroll" feature (visit method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Preserve Scroll' }).click()

      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')
      await expect(page.getByText('Foo is now foo')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('preserves scroll regions when using the "preserve-scroll" feature (GET method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Preserve Scroll (GET)' }).click()

      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')
      await expect(page.getByText('Foo is now bar')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('preserves scroll regions when using the "preserve-scroll" feature from a callback', async ({ page }) => {
      consoleMessages.listen(page)
      await page
        .getByRole('link', { exact: true, name: 'Preserve Scroll (Callback)' })
        .click({ position: { x: 0, y: 0 } })

      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')
      await expect(page.getByText('Foo is now baz')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()

      const message = JSON.parse(consoleMessages.messages[0])

      await expect(message.component).not.toBeUndefined()
      await expect(message.props).not.toBeUndefined()
      await expect(message.url).not.toBeUndefined()
      await expect(message.version).not.toBeUndefined()
    })

    test('restores all tracked scroll regions when pressing the back button (visit method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Preserve Scroll' }).click()

      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')

      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
      )

      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll')
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('restores all tracked scroll regions when pressing the back button (GET method)', async ({ page }) => {
      await page.getByRole('link', { exact: true, name: 'Preserve Scroll (GET)' }).click()

      await expect(page).toHaveURL('/visits/preserve-scroll-page-two')

      await scrollElementTo(
        page,
        page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
      )

      await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll')
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })

    test('restores all tracked scroll regions when pressing the back button from another website', async ({ page }) => {
      await page.getByRole('link', { name: 'Off-site link' }).click()

      await expect(page).toHaveURL('non-inertia')

      await page.goBack()

      await expect(page).toHaveURL('/visits/preserve-scroll')

      await page.waitForTimeout(50)

      await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
      await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
    })
  })
})

test.describe('URL fragment navigation (& automatic scrolling)', () => {
  /** @see https://github.com/inertiajs/inertia/pull/257 */

  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/url-fragments')
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
  })

  const data = [{ label: 'visit' }, { label: 'GET visit' }]

  data.forEach(({ label }) => {
    test(`Scrolls to the fragment element when making a ${label} to a different page`, async ({ page }) => {
      await page.getByRole('link', { name: `Basic ${label}` }).click()
      await expect(page).toHaveURL('/visits/url-fragments#target')
      await expect(page.getByText('Document scroll position is 0 & 0')).not.toBeVisible()
    })

    test(`Scrolls to the fragment element when making a ${label} to the same page`, async ({ page }) => {
      await page.getByRole('link', { exact: true, name: `Fragment ${label}` }).click()
      await expect(page).toHaveURL('/visits/url-fragments#target')
      await expect(page.getByText('Document scroll position is 0 & 0')).not.toBeVisible()
    })

    test(`Does not scroll to the fragment element when it does not exist on the page (${label})`, async ({ page }) => {
      await page.getByRole('link', { exact: true, name: `Non-existent fragment ${label}` }).click()
      await expect(page).toHaveURL('/visits/url-fragments#non-existent-fragment')
      await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
    })
  })
})

test.describe('Partial Reloads', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/partial-reloads')
    await expect(page.getByText('Foo is now 1')).toBeVisible()
    await expect(page.getByText('Bar is now 2')).toBeVisible()
    await expect(page.getByText('Baz is now 3')).toBeVisible()
  })

  const data = [{ label: 'visit' }, { label: 'GET' }]

  data.forEach(({ label }) => {
    test(`does not have headers specific to partial reloads when the feature is not being used ${label}`, async ({
      page,
    }) => {
      requests.listen(page)

      await page.getByRole('link', { name: `Update All (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(requests.requests).toHaveLength(1)

      const request = requests.requests[0]

      await expect(request.headers()['x-inertia-partial-component']).toBeUndefined()
      await expect(request.headers()['x-inertia-partial-data']).toBeUndefined()
    })

    test(`has headers specific to "only" partial reloads (${label})`, async ({ page }) => {
      requests.listen(page)

      await page.getByRole('link', { name: `'Only' foo + bar (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(requests.requests).toHaveLength(1)

      const request = requests.requests[0]

      await expect(request.headers()['x-inertia-partial-component']).toBe('Visits/PartialReloads')
      await expect(request.headers()['x-inertia-partial-data']).toBe('headers,foo,bar')
      await expect(request.headers()['accept']).toBe('text/html, application/xhtml+xml')
      await expect(request.headers()['x-requested-with']).toBe('XMLHttpRequest')
      await expect(request.headers()['x-inertia']).toBe('true')
    })

    test(`has headers specific to "except" partial reloads (${label})`, async ({ page }) => {
      requests.listen(page)

      await page.getByRole('link', { name: `'Except' foo + bar (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(requests.requests).toHaveLength(1)

      const request = requests.requests[0]

      await expect(request.headers()['x-inertia-partial-component']).toBe('Visits/PartialReloads')
      await expect(request.headers()['x-inertia-partial-except']).toBe('foo,bar')
      await expect(request.headers()['accept']).toBe('text/html, application/xhtml+xml')
      await expect(request.headers()['x-requested-with']).toBe('XMLHttpRequest')
      await expect(request.headers()['x-inertia']).toBe('true')
    })

    test(`it updates all props when the feature is not being used (${label})`, async ({ page }) => {
      await page.getByRole('link', { name: `Update All (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(page.getByText('Foo is now 2')).toBeVisible()
      await expect(page.getByText('Bar is now 3')).toBeVisible()
      await expect(page.getByText('Baz is now 4')).toBeVisible()
    })

    test(`it only updates props that are passed through "only" (${label})`, async ({ page }) => {
      await page.getByRole('link', { name: `'Only' foo + bar (${label})` }).click()

      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(page.getByText('Foo is now 2')).toBeVisible()
      await expect(page.getByText('Bar is now 3')).toBeVisible()
      await expect(page.getByText('Baz is now 3')).toBeVisible()

      await page.getByRole('link', { name: `'Only' baz (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(page.getByText('Foo is now 2')).toBeVisible()
      await expect(page.getByText('Bar is now 3')).toBeVisible()
      await expect(page.getByText('Baz is now 5')).toBeVisible()

      await page.getByRole('link', { name: `Update All (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(page.getByText('Foo is now 3')).toBeVisible()
      await expect(page.getByText('Bar is now 4')).toBeVisible()
      await expect(page.getByText('Baz is now 5')).toBeVisible()
    })

    test(`it only updates props that are not passed through "except" (${label})`, async ({ page }) => {
      await page.getByRole('link', { name: `'Except' foo + bar (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(page.getByText('Foo is now 1')).toBeVisible()
      await expect(page.getByText('Bar is now 2')).toBeVisible()
      await expect(page.getByText('Baz is now 4')).toBeVisible()

      await page.getByRole('link', { name: `'Except' baz (${label})` }).click()
      await expect(page).toHaveURL('/visits/partial-reloads')

      await expect(page.getByText('Foo is now 2')).toBeVisible()
      await expect(page.getByText('Bar is now 3')).toBeVisible()
      await expect(page.getByText('Baz is now 4')).toBeVisible()
    })
  })
})

test('can reload on mount', async ({ page }) => {
  await page.goto('/visits/reload-on-mount')
  await expect(page.getByText('Name is mounted!')).toBeVisible()
})

test.describe('Error bags', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/error-bags')
  })

  test('does not use error bags by default', async ({ page }) => {
    await page.getByRole('link', { name: 'Default visit' }).click()

    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.method).toBe('post')
    await expect(dump.headers).not.toContain('x-inertia-error-bag')
  })

  test('uses error bags using the visit method', async ({ page }) => {
    await page.getByRole('link', { name: 'Basic visit' }).click()

    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.method).toBe('post')
    await expect(dump.headers['x-inertia-error-bag']).toContain('visitErrorBag')
    await expect(dump.form.foo).toBe('bar')
  })

  test('uses error bags using the POST method', async ({ page }) => {
    await page.getByRole('link', { name: 'POST visit' }).click()

    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.method).toBe('post')
    await expect(dump.headers['x-inertia-error-bag']).toContain('postErrorBag')
    await expect(dump.form.foo).toBe('baz')
  })
})

test.describe('Redirects', () => {
  test('follows 303 redirects', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/')

    await page.getByRole('link', { name: 'Manual Redirect visit' }).click()
    await shouldBeDumpPage(page, 'get')
  })

  test('follows external redirects', async ({ page }) => {
    pageLoads.watch(page, 2)
    await page.goto('/')

    await page.getByRole('link', { name: 'Manual External Redirect visit' }).click()
    await expect(page).toHaveURL('/non-inertia')
    await expect(pageLoads.count).toBe(2)
  })
})
