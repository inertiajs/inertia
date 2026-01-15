import { expect, Page, test } from '@playwright/test'
import { consoleMessages, pageLoads, requests, scrollElementTo, shouldBeDumpPage, waitForScrollPosition } from './support'

declare const process: { env: { PACKAGE?: string } }

test.beforeEach(async ({ page }) => {})

test('visits a different page', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/')
  await page.getByRole('link', { name: 'Basic Links' }).click()
  await expect(page).toHaveURL('/links/method')
  await expect(page.getByText('This is the links page that demonstrates inertia-link methods')).toBeVisible()
})

test('can make a location visit', async ({ page }) => {
  pageLoads.watch(page, 2)

  await page.goto('/links/location')
  await page.getByRole('link', { name: 'Location visit' }).click()
  const dump = await shouldBeDumpPage(page, 'get')
  await expect(dump['x-inertia']).toBeUndefined()
})

test('will avoid an extra reload after a location visit', async ({ page }) => {
  pageLoads.watch(page, 2)

  await page.goto('/links/location')
  requests.listen(page)

  await expect(requests.requests.length).toBe(0)
  await page.getByRole('link', { name: 'Location visit' }).click()
  const dump = await shouldBeDumpPage(page, 'get')
  await expect(dump['x-inertia']).toBeUndefined()
  // /location',
  // /dump/get',
  // /assets/index-*.js',
  await expect(requests.requests.length).toBe(3)
})

test('will automatically cancel a pending visits when a new request is made', async ({ page }) => {
  pageLoads.watch(page)

  consoleMessages.listen(page)

  await page.goto('/links/automatic-cancellation')

  await page.getByRole('link', { name: 'Link' }).click()
  await page.getByRole('link', { name: 'Link' }).click()

  await expect(consoleMessages.messages).toHaveLength(3)
  await expect(consoleMessages.messages[0]).toBe('started')
  await expect(consoleMessages.messages[1]).toBe('cancelled')
  await expect(consoleMessages.messages[2]).toBe('started')
})

test.describe('methods', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)

    await page.goto('/links/method')
  })

  const data = [
    { method: 'get', label: 'GET', el: 'link' },
    { method: 'post', label: 'POST', el: 'button' },
    { method: 'put', label: 'PUT', el: 'button' },
    { method: 'patch', label: 'PATCH', el: 'button' },
    { method: 'delete', label: 'DELETE', el: 'button' },
    { method: 'post', label: 'OBJECT', el: 'button' },
    { method: 'post', label: 'OBJECT METHOD OVERRIDE', el: 'button' },
  ] as const

  data.forEach(({ method, label, el }) => {
    test(`can use the ${label} method`, async ({ page }) => {
      await page.getByRole(el, { name: `${label} Link` }).click()

      const dump = await shouldBeDumpPage(page, method)

      await expect(dump.query).toEqual({})
      await expect(dump.method).toBe(method)
      await expect(dump.form).toEqual({})
    })
  })
})

test.describe('data', () => {
  test.describe('query string array formatter', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/links/data/object')
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

        await expect(dump.query).toEqual({ a: ['b', 'c'] })
        await expect(dump.method).toBe('get')
        await expect(dump.form).toEqual({})
        await expect(dump.headers['content-type']).not.toBe('application/json')
      })
    })
  })

  test.describe('plain objects', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/links/data/object')
    })

    test('passes data as query params', async ({ page }) => {
      await page.getByRole('link', { name: 'GET Link' }).click()

      const dump = await shouldBeDumpPage(page, 'get')

      await expect(page).toHaveURL('/dump/get?foo=get')
      await expect(dump.query).toEqual({ foo: 'get' })
      await expect(dump.method).toBe('get')
      await expect(dump.form).toEqual({})
      await expect(dump.headers['content-type']).not.toBe('application/json')
    })

    const data = [
      { method: 'post', label: 'POST', form: { bar: 'post' } },
      { method: 'put', label: 'PUT', form: { baz: 'put' } },
      { method: 'patch', label: 'PATCH', form: { foo: 'patch' } },
      { method: 'delete', label: 'DELETE', form: { bar: 'delete' } },
    ] as const

    data.forEach(({ method, label, form }) => {
      test(`can pass data using the ${label} method`, async ({ page }) => {
        await page.getByRole('button', { name: `${label} Link` }).click()

        const dump = await shouldBeDumpPage(page, method)

        await expect(dump.method).toBe(method)
        await expect(dump.form).toEqual(form)
        await expect(dump.files).toEqual({})
        await expect(dump.headers['content-type']).toBe('application/json')
      })
    })
  })

  test.describe('form data objects', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/links/data/form-data')
    })

    const data = [
      { method: 'post', label: 'POST' },
      { method: 'put', label: 'PUT' },
      { method: 'patch', label: 'PATCH' },
      { method: 'delete', label: 'DELETE' },
    ] as const

    data.forEach(({ method, label }) => {
      test(`can pass data using the ${label} method`, async ({ page }) => {
        await page.getByRole('button', { name: `${label} Link` }).click()

        const dump = await shouldBeDumpPage(page, method)

        await expect(dump.method).toBe(method)
        await expect(dump.form).toEqual({ bar: 'baz' })
        await expect(dump.files).toEqual([])
        await expect(dump.headers['content-type']).toContain('multipart/form-data; boundary=')
      })
    })
  })

  test.describe('auto-converted objects to form-data when files are present', () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/links/data/auto-converted')
    })

    const data = [
      { method: 'post', label: 'POST' },
      { method: 'put', label: 'PUT' },
      { method: 'patch', label: 'PATCH' },
      { method: 'delete', label: 'DELETE' },
    ] as const

    data.forEach(({ method, label }) => {
      test(`auto-converts objects using the ${label} method`, async ({ page }) => {
        await page.getByRole('button', { name: `${label} Link` }).click()

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

test.describe('headers', () => {
  test('has the default set of headers', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/headers')

    await page.getByRole('link', { name: 'Standard visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.headers['x-inertia']).toBe('true')
    await expect(dump.headers['x-inertia-version']).toBeUndefined()
    await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
    await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
  })

  test('starts using the x-inertia-version header when a version was given from the back-end', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/headers/version')

    await page.getByRole('link', { name: 'Standard visit Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.headers['x-inertia-version']).toBe('example-version-header')
  })

  test('allows to set custom headers', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/headers')

    await page.getByRole('link', { name: 'GET Link' }).click()

    const dump = await shouldBeDumpPage(page, 'get')

    await expect(dump.headers['x-inertia']).toBe('true')
    await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
    await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
    await expect(dump.headers['foo']).toBe('bar')
  })

  test('cannot override built-in Inertia headers', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/headers')

    await page.getByRole('button', { name: 'POST Link' }).click()

    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.headers['x-inertia']).toBe('true')
    await expect(dump.headers['x-requested-with']).toBe('XMLHttpRequest')
    await expect(dump.headers['accept']).toBe('text/html, application/xhtml+xml')
    await expect(dump.headers['bar']).toBe('baz')
  })
})

test.describe('replace', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)

    await page.goto('/')
    await page.getByRole('link', { name: "'Replace' Links" }).click()
    await expect(page).toHaveURL('/links/replace')
  })

  test('replaces the current history state', async ({ page }) => {
    await page.getByRole('link', { name: '[State] Replace: true' }).click()
    await shouldBeDumpPage(page, 'get')

    await page.goBack()
    await expect(page).toHaveURL('/')

    await page.goForward()
    await expect(page).toHaveURL('/dump/get')
  })

  test('does not replace the current history state when it is set to false', async ({ page }) => {
    await page.getByRole('link', { name: '[State] Replace: false' }).click()
    await shouldBeDumpPage(page, 'get')

    await page.goBack()
    await expect(page).toHaveURL('/links/replace')

    await page.goForward()
    await expect(page).toHaveURL('/dump/get')
  })
})

test.describe('preserve state', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/preserve-state')
  })

  const preserveData = [
    {
      testLabel: 'default',
      label: '[State] Preserve: true',
      expected: 'bar',
    },
    {
      testLabel: 'callback',
      label: '[State] Preserve Callback: true',
      expected: 'callback-bar',
    },
  ] as const

  preserveData.forEach(({ label, expected, testLabel }) => {
    test(`preserves the page's local state (${testLabel})`, async ({ page }) => {
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await page.getByLabel('Example Field').fill('Example value')

      const componentKey = await page.evaluate(() => (window as any)._inertia_page_key)
      await expect(componentKey).not.toBeUndefined()

      await page.getByRole('link', { name: label }).click()
      await expect(page).toHaveURL(`/links/preserve-state-page-two?foo=${expected}`)

      const newComponentKey = await page.evaluate(() => (window as any)._inertia_page_key)
      await expect(newComponentKey).not.toBeUndefined()

      await expect(newComponentKey).toBe(componentKey)
      await expect(page.getByLabel('Example Field')).toHaveValue('Example value')
      await expect(page.getByText(`Foo is now ${expected}`)).toBeVisible()
    })
  })

  const dontPreserveData = [
    {
      testLabel: 'default',
      label: '[State] Preserve: false',
      expected: 'baz',
    },
    {
      testLabel: 'callback',
      label: '[State] Preserve Callback: false',
      expected: 'callback-baz',
    },
  ] as const

  dontPreserveData.forEach(({ label, testLabel, expected }) => {
    test(`does not preserve the page's local state (${testLabel})`, async ({ page }) => {
      await expect(page.getByText('Foo is now default')).toBeVisible()
      await page.getByLabel('Example Field').fill('Another value')

      // @ts-ignore
      const componentKey = await page.evaluate(() => window._inertia_page_key)
      await expect(componentKey).not.toBeUndefined()

      await page.getByRole('link', { name: label }).click()
      await expect(page).toHaveURL(`/links/preserve-state-page-two?foo=${expected}`)

      // @ts-ignore
      const newComponentKey = await page.evaluate(() => window._inertia_page_key)
      await expect(newComponentKey).not.toBeUndefined()

      await expect(newComponentKey).not.toBe(componentKey)
      await expect(page.getByLabel('Example Field')).toHaveValue('')
      await expect(page.getByText(`Foo is now ${expected}`)).toBeVisible()
    })
  })
})

test.describe('preserve url', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/preserve-url')
  })

  test('preserves the current URL', async ({ page }) => {
    await expect(page.getByText('Foo is now default')).toBeVisible()
    const initialUrl = page.url()

    await page.getByRole('link', { name: '[URL] Preserve: true' }).click()
    await expect(page.getByText('Foo is now bar')).toBeVisible()
    await expect(page).toHaveURL(initialUrl) // URL should remain the same
  })

  test('does not preserve the current URL', async ({ page }) => {
    await expect(page.getByText('Foo is now default')).toBeVisible()
    const initialUrl = page.url()

    await page.getByRole('link', { name: '[URL] Preserve: false' }).click()
    await expect(page).toHaveURL('/links/preserve-url-page-two?foo=baz')
    await expect(page.getByText('Foo is now baz')).toBeVisible()
    await expect(page.url()).not.toBe(initialUrl) // URL should have changed
  })

  test('can load more items with preserveUrl via Link', async ({ page }) => {
    await expect(page.getByText('Items loaded: 3')).toBeVisible()
    await expect(page.locator('.has-next-page')).toHaveText('true')

    await page.getByRole('link', { name: 'Load More' }).click()

    // With mergeProps, the items.data array should be merged, giving us 6 total items
    await expect(page.getByText('Items loaded: 6')).toBeVisible()
    await expect(page).toHaveURL('/links/preserve-url')
  })

  test('can load more items with preserveUrl via router.visit', async ({ page }) => {
    await expect(page.getByText('Items loaded: 3')).toBeVisible()
    await expect(page.locator('.has-next-page')).toHaveText('true')

    await page.getByRole('button', { name: 'Load More Router' }).click()

    // With mergeProps, the items.data array should be merged, giving us 6 total items
    await expect(page.getByText('Items loaded: 6')).toBeVisible()
    await expect(page).toHaveURL('/links/preserve-url')
  })
})

test.describe('preserve scroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/links/preserve-scroll-false')
    await expect(page.getByText('Foo is now default')).toBeVisible()

    await scrollElementTo(
      page,
      page.evaluate(() => window.scrollTo(5, 7)),
    )
    await scrollElementTo(
      page,
      page.evaluate(() => document.querySelector('#slot')?.scrollTo(10, 15)),
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
  })

  test('does not reset untracked scroll regions in persistent layouts', async ({ page }) => {
    await page.getByRole('link', { exact: true, name: 'Reset Scroll' }).click()
    await expect(page).toHaveURL('/links/preserve-scroll-false-page-two?foo=bar')
    await expect(page.getByText('Foo is now bar')).toBeVisible()
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
  })

  test('does not reset untracked scroll regions in persistent layouts when returning false from a preserveScroll callback', async ({
    page,
  }) => {
    consoleMessages.listen(page)

    await page.getByRole('link', { exact: true, name: 'Reset Scroll (Callback)' }).click({ position: { x: 0, y: 0 } })
    await expect(page).toHaveURL('/links/preserve-scroll-false-page-two?foo=foo')
    await expect(page.getByText('Foo is now foo')).toBeVisible()
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()

    await expect(consoleMessages.messages).toHaveLength(1)

    const message = JSON.parse(consoleMessages.messages[0])

    await expect(message.component).not.toBeUndefined()
    await expect(message.props).not.toBeUndefined()
    await expect(message.url).not.toBeUndefined()
    await expect(message.version).not.toBeUndefined()
  })

  test('does not restore untracked scroll regions when pressing the back button', async ({ page }) => {
    await page.getByRole('link', { exact: true, name: 'Reset Scroll' }).click()

    await expect(page).toHaveURL('/links/preserve-scroll-false-page-two?foo=bar')
    await expect(page.getByText('Foo is now bar')).toBeVisible()

    await scrollElementTo(
      page,
      page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
    )
    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

    await page.goBack()

    await expect(page).toHaveURL('/links/preserve-scroll-false')
    await expect(page.getByText('Foo is now default')).toBeVisible()
    await expect(page.getByRole('button', { exact: true, name: 'Update scroll positions' })).toBeVisible()

    await page.waitForFunction(
      () => document.documentElement.scrollTop === 7 && document.documentElement.scrollLeft === 5,
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
  })

  test('does not restore untracked scroll regions when returning true from a preserveScroll callback', async ({
    page,
  }) => {
    consoleMessages.listen(page)
    await page
      .getByRole('link', { exact: true, name: 'Preserve Scroll (Callback)' })
      .click({ position: { x: 0, y: 0 } })

    await expect(page).toHaveURL('/links/preserve-scroll-false-page-two?foo=baz')
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

    await expect(page).toHaveURL('/links/preserve-scroll-false')
    await expect(page.getByText('Foo is now default')).toBeVisible()

    await page.waitForFunction(
      () => document.documentElement.scrollTop === 7 && document.documentElement.scrollLeft === 5,
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
  })

  test.skip('does not restore untracked scroll regions when pressing the back button from another website', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Off-site link' }).click()

    await expect(page).toHaveURL('non-inertia')

    await page.goBack()

    await expect(page).toHaveURL('/links/preserve-scroll-false')
    await expect(page.getByText('Foo is now default')).toBeVisible()

    await page.waitForFunction(
      () => document.documentElement.scrollTop === 7 && document.documentElement.scrollLeft === 5,
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
  })
})

test.describe('enabled', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/links/preserve-scroll')
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
    await page.waitForTimeout(100)
  })

  test('resets scroll regions to the top when doing a regular visit', async ({ page }) => {
    await page.getByText('Reset Scroll', { exact: true }).click()
    await expect(page).toHaveURL('/links/preserve-scroll-page-two?foo=bar')
    await expect(page.getByText('Foo is now bar')).toBeVisible()
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
  })

  test('resets scroll regions to the top when returning false from a preserveScroll callback', async ({ page }) => {
    consoleMessages.listen(page)
    await page.getByText('Reset Scroll (Callback)', { exact: true }).click({ position: { x: 0, y: 0 } })

    await expect(page).toHaveURL('/links/preserve-scroll-page-two?foo=foo')
    await expect(page.getByText('Foo is now foo')).toBeVisible()
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

    await expect(consoleMessages.messages).toHaveLength(1)
    const message = JSON.parse(consoleMessages.messages[0])

    await expect(message.component).not.toBeUndefined()
    await expect(message.props).not.toBeUndefined()
    await expect(message.url).not.toBeUndefined()
    await expect(message.version).not.toBeUndefined()
  })

  test('preserves scroll regions when using the "preserve-scroll" feature', async ({ page }) => {
    await page.getByText('Preserve Scroll', { exact: true }).click()

    await expect(page).toHaveURL('/links/preserve-scroll-page-two?foo=baz')
    await expect(page.getByText('Foo is now baz')).toBeVisible()
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
  })

  test('preserves scroll regions when using the "preserve-scroll" feature from a callback', async ({ page }) => {
    consoleMessages.listen(page)
    await page.getByText('Preserve Scroll (Callback)', { exact: true }).click({ position: { x: 0, y: 0 } })

    await expect(page).toHaveURL('/links/preserve-scroll-page-two?foo=baz')
    await expect(page.getByText('Foo is now baz')).toBeVisible()
    await waitForScrollPosition(page, 5, 7)

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()

    const message = JSON.parse(consoleMessages.messages[0])

    await expect(message.component).not.toBeUndefined()
    await expect(message.props).not.toBeUndefined()
    await expect(message.url).not.toBeUndefined()
    await expect(message.version).not.toBeUndefined()
  })

  test('restores all tracked scroll regions when pressing the back button', async ({ page }) => {
    await page.getByTestId('preserve').click()
    await expect(page).toHaveURL('/links/preserve-scroll-page-two?foo=baz')
    await page.waitForTimeout(100)

    await scrollElementTo(
      page,
      page.evaluate(() => document.querySelector('#slot')?.scrollTo(0, 0)),
    )

    await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()

    await page.goBack()

    await expect(page).toHaveURL('/links/preserve-scroll')
    await expect(page.getByText('Foo is now default')).toBeVisible()

    await page.waitForFunction(
      () => document.documentElement.scrollTop === 7 && document.documentElement.scrollLeft === 5,
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
  })

  test('restores the document scroll position when pressing the back button with history encryption enabled', async ({
    page,
  }) => {
    await page.getByTestId('article').click()

    await expect(page).toHaveURL('/article')
    await expect(page.getByText('Article Header')).toBeVisible()

    await scrollElementTo(
      page,
      page.evaluate(() => document.querySelector('#home')?.scrollIntoView()),
    )

    const bottomScrollPosition = await page.evaluate(() => document.documentElement.scrollTop)
    expect(bottomScrollPosition).toBeGreaterThan(500)

    await page.getByTestId('home').click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('This is the Test App Entrypoint page')).toBeVisible()

    const homeScrollPosition = await page.evaluate(() => document.documentElement.scrollTop)
    expect(homeScrollPosition).toBe(0)

    await page.goBack()

    await expect(page).toHaveURL('/article')
    await expect(page.getByText('Article Header')).toBeVisible()

    await page.waitForFunction(
      (expectedPosition) => document.documentElement.scrollTop === expectedPosition,
      bottomScrollPosition,
      { timeout: 1000 },
    )
  })

  test.skip('restores all tracked scroll regions when pressing the back button from another website', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Off-site link' }).click()

    await expect(page).toHaveURL('non-inertia')

    await page.goBack()

    await expect(page).toHaveURL('/links/preserve-scroll')

    await page.waitForFunction(
      () => document.documentElement.scrollTop === 7 && document.documentElement.scrollLeft === 5,
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
  })
})

test.describe('scroll region with scrollable list', () => {
  const preparePage = async (page: Page, url: string) => {
    await page.goto('/links/scroll-region-list')
    await expect(page.getByText('Scrollable list with scroll region')).toBeVisible()
    await expect(page.getByText('Clicked user: none')).toBeVisible()

    await page.evaluate(() => {
      // @ts-ignore
      window.navigateEvents = window.navigateEvents || []

      document.addEventListener('inertia:navigate', (e) => {
        // @ts-ignore
        window.navigateEvents.push(e)
      })
    })

    await scrollElementTo(
      page,
      page.evaluate(() => window.scrollTo(5, 7)),
    )

    await scrollElementTo(
      page,
      page.evaluate(() => document.querySelector('#slot')?.scrollTo(10, 15)),
    )

    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()

    await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
    await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
  }

  Object.entries({
    '/links/scroll-region-list': 'navigate to another url',
    '/links/scroll-region-list?user_id=1': 'stay on the same url',
  }).forEach(([url, description]) => {
    test.describe(`when visiting a URL that would ${description}`, () => {
      test.beforeEach(async ({ page }) => await preparePage(page, url))

      test('resets scroll regions when clicking default button', async ({ page }) => {
        await page.waitForFunction(() => (window as any).navigateEvents.length === 0)
        await page.getByRole('button', { exact: true, name: 'Default' }).first().click()

        await expect(page).toHaveURL('/links/scroll-region-list?user_id=1')
        await expect(page.getByText('Clicked user: 1')).toBeVisible()
        await page.waitForFunction(() => (window as any).navigateEvents.length === 1)

        await page.waitForTimeout(100)
        await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
        await page.waitForTimeout(100)

        await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
        await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
      })

      test('resets scroll regions when clicking preserve false button', async ({ page }) => {
        await page.waitForFunction(() => (window as any).navigateEvents.length === 0)
        await page.getByRole('button', { exact: true, name: 'Preserve False' }).first().click()

        await expect(page).toHaveURL('/links/scroll-region-list?user_id=1')
        await expect(page.getByText('Clicked user: 1')).toBeVisible()
        await page.waitForFunction(() => (window as any).navigateEvents.length === 1)

        await page.waitForTimeout(100)
        await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
        await page.waitForTimeout(100)

        await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
        await expect(page.getByText('Slot scroll position is 0 & 0')).toBeVisible()
      })

      test('preserves scroll regions when clicking preserve true button', async ({ page }) => {
        await page.waitForFunction(() => (window as any).navigateEvents.length === 0)
        await page.getByRole('button', { exact: true, name: 'Preserve True' }).first().click()

        await expect(page).toHaveURL('/links/scroll-region-list?user_id=1')
        await expect(page.getByText('Clicked user: 1')).toBeVisible()
        await page.waitForFunction(() => (window as any).navigateEvents.length === 1)

        await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()

        await expect(page.getByText('Document scroll position is 5 & 7')).toBeVisible()
        await expect(page.getByText('Slot scroll position is 10 & 15')).toBeVisible()
      })
    })
  })
})

test.describe('URL fragment navigation (& automatic scrolling)', () => {
  /** @see https://github.com/inertiajs/inertia/pull/257 */

  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/url-fragments')
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
  })

  test('scrolls to the fragment element when making a visit to a different page', async ({ page }) => {
    await page.getByRole('link', { name: 'Basic link' }).click()
    await expect(page).toHaveURL('/links/url-fragments#target')
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).not.toBeVisible()
  })

  test('scrolls to the fragment element when making a visit to the same page', async ({ page }) => {
    await page.getByRole('link', { exact: true, name: 'Fragment link' }).click()
    await expect(page).toHaveURL('/links/url-fragments#target')
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).not.toBeVisible()
  })

  test('does not scroll to the fragment element when it does not exist on the page', async ({ page }) => {
    await page.getByRole('link', { exact: true, name: 'Non-existent fragment link' }).click()
    await expect(page).toHaveURL('/links/url-fragments#non-existent-fragment')
    await page.getByRole('button', { exact: true, name: 'Update scroll positions' }).click()
    await expect(page.getByText('Document scroll position is 0 & 0')).toBeVisible()
  })
})

test.describe('scroll', () => {
  test('scrolls to the fragment on initial page load', async ({ page }) => {
    await page.goto('/article#far-down')
    await expect(page.getByRole('heading', { name: 'Article Header' })).toBeVisible()

    const scrollTop = await page.evaluate(() => document.documentElement.scrollTop)
    expect(scrollTop).toBeGreaterThan(500)
  })

  test('does not scroll when clicking the same fragment link', async ({ page }) => {
    /** @see https://github.com/inertiajs/inertia/issues/1921 */
    await page.goto('/article#far-down')

    await page.getByRole('button', { exact: true, name: 'Enable Smooth Scroll' }).click()
    await page.getByRole('button', { exact: true, name: 'Clear Scroll Log' }).click()
    await expect(page.getByText('Scroll log: []')).toBeVisible()

    // Click the same link again
    for (let i = 0; i < 5; i++) {
      await page.getByRole('link', { exact: true, name: 'Article Far Down' }).click()
    }
    await expect(page.getByText('Scroll log: []')).toBeVisible()
  })

  test('scrolls to top after the page has been rendered', async ({ page }) => {
    test.setTimeout(10_000)

    await page.goto('/scroll-after-render/1')

    consoleMessages.listen(page)

    const tries = 10

    for (let i = 2; i < tries + 2; i++) {
      await page.getByRole('link', { exact: true, name: 'Go to page ' + i }).click()
      await expect(page.getByText('Page ' + i)).toBeVisible()
      await expect(page).toHaveURL('/scroll-after-render/' + i)
    }

    const expectedMessages = Array.from({ length: tries }, () => ['ScrollY 100', 'Render', 'ScrollY 0']).flat()
    await expect(consoleMessages.messages).toEqual(expectedMessages)
  })

  test('preserves scroll position within a scroll region while keeping scrolling when navigating', async ({ page }) => {
    await page.goto('/scroll-region-preserve-url/1')
    await expect(page.getByText('Page: 1')).toBeVisible()

    await page.click('#scroll-and-navigate')
    await expect(page.getByText('Page: 2')).toBeVisible()

    // Verify scroll position was preserved (should be +100px, not 0)
    const finalScroll = await page.locator('#scroll-container').evaluate((el) => el.scrollTop)
    expect(finalScroll).toBeGreaterThan(100)
  })
})

test.describe('partial reloads', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/links/partial-reloads')
    await expect(page.getByText('Foo is now 1')).toBeVisible()
    await expect(page.getByText('Bar is now 2')).toBeVisible()
    await expect(page.getByText('Baz is now 3')).toBeVisible()
  })

  test('does not have headers specific to partial reloads when the feature is not being used', async ({ page }) => {
    requests.listen(page)

    await page.getByRole('link', { name: 'Update All' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=1')

    await expect(requests.requests).toHaveLength(1)

    const request = requests.requests[0]

    await expect(request.headers()['x-inertia-partial-component']).toBeUndefined()
    await expect(request.headers()['x-inertia-partial-data']).toBeUndefined()
  })

  test('has headers specific to partial reloads', async ({ page }) => {
    requests.listen(page)

    await page.getByRole('link', { name: 'Only foo + bar' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=1')

    await expect(requests.requests).toHaveLength(1)

    const request = requests.requests[0]

    await expect(request.headers()['x-inertia-partial-component']).toBe('Links/PartialReloads')
    await expect(request.headers()['x-inertia-partial-data']).toBe('headers,foo,bar')
    await expect(request.headers()['accept']).toBe('text/html, application/xhtml+xml')
    await expect(request.headers()['x-requested-with']).toBe('XMLHttpRequest')
    await expect(request.headers()['x-inertia']).toBe('true')
  })

  test('it updates all props when the feature is not being used', async ({ page }) => {
    await page.getByRole('link', { name: 'Update All' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=1')

    await expect(page.getByText('Foo is now 2')).toBeVisible()
    await expect(page.getByText('Bar is now 3')).toBeVisible()
    await expect(page.getByText('Baz is now 4')).toBeVisible()
  })

  test('it only updates props that are passed through "only"', async ({ page }) => {
    await page.getByRole('link', { name: 'Only foo + bar' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=1')

    await expect(page.getByText('Foo is now 2')).toBeVisible()
    await expect(page.getByText('Bar is now 3')).toBeVisible()
    await expect(page.getByText('Baz is now 3')).toBeVisible()

    await page.getByRole('link', { name: 'Only baz' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=2')

    await expect(page.getByText('Foo is now 2')).toBeVisible()
    await expect(page.getByText('Bar is now 3')).toBeVisible()
    await expect(page.getByText('Baz is now 5')).toBeVisible()

    await page.getByRole('link', { name: 'Update All' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=2')

    await expect(page.getByText('Foo is now 3')).toBeVisible()
    await expect(page.getByText('Bar is now 4')).toBeVisible()
    await expect(page.getByText('Baz is now 5')).toBeVisible()
  })

  test('it only updates props that are not passed through "except"', async ({ page }) => {
    await page.getByRole('link', { name: 'Except foo + bar' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=1')

    await expect(page.getByText('Foo is now 1')).toBeVisible()
    await expect(page.getByText('Bar is now 2')).toBeVisible()
    await expect(page.getByText('Baz is now 4')).toBeVisible()

    await page.getByRole('link', { name: 'Except baz' }).click()
    await expect(page).toHaveURL('/links/partial-reloads?foo=1')

    await expect(page.getByText('Foo is now 2')).toBeVisible()
    await expect(page.getByText('Bar is now 3')).toBeVisible()
    await expect(page.getByText('Baz is now 4')).toBeVisible()
  })
})

test.describe('redirects', () => {
  test('follows 303 redirects', async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/')

    await page.getByRole('button', { name: 'Internal Redirect Link' }).click()
    await shouldBeDumpPage(page, 'get')
  })

  test('follows external redirects', async ({ page }) => {
    pageLoads.watch(page, 2)
    await page.goto('/')

    await page.getByRole('button', { name: 'External Redirect Link' }).click()
    await expect(page).toHaveURL('/non-inertia')
    await expect(pageLoads.count).toBe(2)
  })
})

test.describe('"as" attribute', () => {
  test('GET defaults to link', async ({ page }) => {
    await page.goto('/links/as-warning/get')
    await expect(page.getByRole('link', { name: 'GET Link' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'GET Link' })).not.toBeVisible()
  })

  test('GET can display as button', async ({ page }) => {
    await page.goto('/links/as-warning-false/get')
    await expect(page.getByRole('link', { name: 'GET button Link' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'GET button Link' })).toBeVisible()
  })

  const data = [
    { method: 'post', label: 'POST' },
    { method: 'put', label: 'PUT' },
    { method: 'patch', label: 'PATCH' },
    { method: 'delete', label: 'DELETE' },
  ] as const

  data.forEach(({ method, label }) => {
    test(`forces a button for non-GET ${label} links`, async ({ page }) => {
      await page.goto(`/links/as-warning/${method}`)
      await expect(page.getByRole('link', { name: `${label} Link` })).not.toBeVisible()
      await expect(page.getByRole('button', { name: `${label} Link` })).toBeVisible()

      await page.goto(`/links/as-warning-false/${method}`)
      await expect(page.getByRole('link', { name: `${label} button Link` })).not.toBeVisible()
      await expect(page.getByRole('button', { name: `${label} button Link` })).toBeVisible()
    })
  })
})

test.describe('as component', () => {
  test.skip(process.env.PACKAGE === 'svelte', 'Feature not supported by the Svelte adapter')

  test.beforeEach(async ({ page }) => {
    await page.goto('/links/as-component/1')
  })

  test('can render', async ({ page }) => {
    const button = await page.getByRole('button', { name: 'GET Custom Component' }).first()
    await expect(button).toHaveCSS('background-color', 'rgb(0, 0, 255)')
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(button).toHaveCSS('padding', '10px')

    await button.click()

    const dump = await shouldBeDumpPage(page, 'get')
    await expect(dump.method).toBe('get')
  })

  test('can render with different methods', async ({ page }) => {
    await page.getByText('POST Custom Component').click()

    const dump = await shouldBeDumpPage(page, 'post')
    await expect(dump.method).toBe('post')
  })

  test('can render with data', async ({ page }) => {
    await page.getByText('Custom Component with Data').click()

    const dump = await shouldBeDumpPage(page, 'post')
    await expect(dump.form).toEqual({ test: 'data' })
  })

  test('can render with headers', async ({ page }) => {
    await page.getByText('Custom Component with Headers').click()

    const dump = await shouldBeDumpPage(page, 'get')
    await expect(dump.headers['x-test']).toBe('header')
  })

  test('can render with event handlers', async ({ page }) => {
    await page.getByText('Custom Component with Events').click()

    const dump = await shouldBeDumpPage(page, 'get')
    await expect(dump.method).toBe('get')

    // Check that events were tracked
    const events = await page.evaluate(() => window.componentEvents)
    await expect(events.length).toBe(3)

    await expect(events.map((e) => e.eventName)).toEqual(['onStart', 'onSuccess', 'onFinish'])
  })

  test('can render with "replace" prop', async ({ page }) => {
    await page.goto('/links/as-component/2')

    await page.getByRole('button', { name: 'Custom Component with Replace' }).click()
    await expect(page).toHaveURL('/links/as-component/3')

    await page.goBack()
    await expect(page).toHaveURL('/links/as-component/1')
  })

  test('can render with "preserveState" prop', async ({ page }) => {
    await page.goto('/links/as-component/1')

    const componentState = await page.locator('#state').textContent()

    await page.getByRole('button', { name: 'Custom Component with Preserve State' }).click()
    await expect(page).toHaveURL('/links/as-component/2')

    const newComponentState = await page.locator('#state').textContent()

    await expect(newComponentState).toBe(componentState)
  })
})

test.describe('as element', () => {
  test.skip(process.env.PACKAGE === 'svelte', 'Feature not supported by the Svelte adapter')

  test.beforeEach(async ({ page }) => {
    await page.goto('/links/as-element/1')
  })

  test('can render', async ({ page }) => {
    const button = await page.getByText('GET Custom Element').first()
    // Assert that it's a <div>
    await expect(button.evaluate((node) => node.tagName)).resolves.toBe('DIV')

    await expect(button).toHaveCSS('background-color', 'rgb(0, 0, 255)')
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(button).toHaveCSS('padding', '10px')

    await button.click()

    const dump = await shouldBeDumpPage(page, 'get')
    await expect(dump.method).toBe('get')
  })

  test('can render with different methods', async ({ page }) => {
    await page.getByText('POST Custom Element').click()

    const dump = await shouldBeDumpPage(page, 'post')
    await expect(dump.method).toBe('post')
  })

  test('can render with data', async ({ page }) => {
    await page.getByText('Custom Element with Data').click()

    const dump = await shouldBeDumpPage(page, 'post')
    await expect(dump.form).toEqual({ test: 'data' })
  })

  test('can render with headers', async ({ page }) => {
    await page.getByText('Custom Element with Headers').click()

    const dump = await shouldBeDumpPage(page, 'get')
    await expect(dump.headers['x-test']).toBe('header')
  })

  test('can render with event handlers', async ({ page }) => {
    await page.getByText('Custom Element with Events').click()

    const dump = await shouldBeDumpPage(page, 'get')
    await expect(dump.method).toBe('get')

    // Check that events were tracked
    const events = await page.evaluate(() => window.componentEvents)
    await expect(events.length).toBe(3)

    await expect(events.map((e) => e.eventName)).toEqual(['onStart', 'onSuccess', 'onFinish'])
  })

  test('can render with "replace" prop', async ({ page }) => {
    await page.goto('/links/as-element/2')

    await page.getByText('Custom Element with Replace').click()
    await expect(page).toHaveURL('/links/as-element/3')

    await page.goBack()
    await expect(page).toHaveURL('/links/as-element/1')
  })

  test('can render with "preserveState" prop', async ({ page }) => {
    await page.goto('/links/as-element/1')

    const componentState = await page.locator('#state').textContent()

    await page.getByText('Custom Element with Preserve State').click()
    await expect(page).toHaveURL('/links/as-element/2')

    const newComponentState = await page.locator('#state').textContent()

    await expect(newComponentState).toBe(componentState)
  })
})

test.describe('data-loading attribute', () => {
  test('adds data-loading attribute to link component', async ({ page }) => {
    await page.goto('/links/data-loading')
    const link = await page.getByRole('link', { name: 'First' })
    await link.click()
    await expect(link).toHaveAttribute('data-loading', '')
    await page.waitForResponse('sleep')
    await expect(link).not.toHaveAttribute('data-loading')
  })

  test('handles data-loading attribute for cancelled requests', async ({ page }) => {
    await page.goto('/links/data-loading')
    const link1 = await page.getByRole('link', { name: 'First' })
    const link2 = await page.getByRole('link', { name: 'Second' })
    await link1.click()
    await expect(link1).toHaveAttribute('data-loading', '')
    await expect(link2).not.toHaveAttribute('data-loading', '')
    await link2.click()
    await expect(link1).not.toHaveAttribute('data-loading', '')
    await expect(link2).toHaveAttribute('data-loading', '')
    await page.waitForResponse('sleep')
    await expect(link2).not.toHaveAttribute('data-loading')
  })
})

test('cancels pending request when navigating back', async ({ page }) => {
  await page.goto('/links/cancel-sync-request/1')
  await page.getByRole('link', { name: 'Go to Page 2' }).click()
  await expect(page).toHaveURL('/links/cancel-sync-request/2')
  await page.getByRole('link', { name: 'Go to Page 3' }).click() // This one is slow (500ms)
  await page.goBack()
  await expect(page).toHaveURL('/links/cancel-sync-request/1')
  await page.waitForTimeout(750)
  await expect(page).toHaveURL('/links/cancel-sync-request/1')
  // make sure page 2 is still in the history stack
  await page.goForward()
  await expect(page).toHaveURL('/links/cancel-sync-request/2')
  await page.goBack()
  await expect(page).toHaveURL('/links/cancel-sync-request/1')
})

test.describe('reactivity', () => {
  test('will update href if prop is updated', async ({ page }) => {
    await page.goto('/links/prop-update')
    const link = await page.getByRole('link', { name: 'The Link' })
    const button = await page.getByRole('button', { name: 'Change URL' })
    await expect(link).toHaveAttribute('href', /\/sleep$/)
    await button.click()
    await expect(link).toHaveAttribute('href', /\/something-else$/)
  })

  test('will update the method, href, data, and headers when props are updated', async ({ page }) => {
    await page.goto('/links/reactivity')

    const link = await page.getByRole('link', { name: 'Submit' })
    await expect(link).toHaveAttribute('href', /\/dump\/get\?foo=bar$/)

    await page.getByRole('button', { name: 'Change Link Props' }).click()

    await expect(link).not.toBeVisible()
    const button = await page.getByRole('button', { name: 'Submit' })
    await button.click()

    const dump = await shouldBeDumpPage(page, 'post')

    await expect(dump.method).toBe('post')
    await expect(dump.form).toEqual({ foo: 'baz' })
    await expect(dump.headers['x-custom-header']).toBe('new-value')
  })

  test('will update prefetch and cacheFor when props are updated', async ({ page }) => {
    await page.goto('/links/reactivity')

    await page.getByRole('button', { name: 'Enable Prefetch (1s cache)' }).click()
    const link = await page.getByRole('link', { name: 'Prefetch Link' })
    const prefetchPromise = page.waitForRequest(
      (request) => request.url().includes('/dump/get') && request.headers().purpose === 'prefetch',
    )

    // Wait for the page to be prefetched
    await link.hover()
    await prefetchPromise

    // Visit the page and check that it was prefetched
    requests.listen(page)
    await link.click()
    await expect(page).toHaveURL('dump/get')
    await expect(requests.requests.length).toBe(0)

    // Wait for cache to expire
    await page.waitForTimeout(1200)

    // Click the link again without hovering first
    await page.goBack()
    await page.getByRole('button', { name: 'Enable Prefetch (1s cache)' }).click()
    const nonPrefetchPromise = page.waitForRequest(
      (request) => request.url().includes('/dump/get') && request.headers().purpose !== 'prefetch',
    )
    await link.click()
    await nonPrefetchPromise

    await expect(requests.requests.length).toBe(1)
  })
})

test.describe('path traversal', () => {
  test('it goes one level up', async ({ page }) => {
    await page.goto('/links/sub/sub/')

    await page.getByRole('link', { name: 'Up one level' }).click()
    await expect(page).toHaveURL('/links/sub/')
  })

  test('it goes two levels up with a new path', async ({ page }) => {
    await page.goto('/links/sub/sub/')

    await page.getByRole('link', { name: 'Up two levels and open method' }).click()
    await expect(page).toHaveURL('/links/method')
  })

  test('it goes three levels up', async ({ page }) => {
    await page.goto('/links/sub/sub/')

    await page.getByRole('link', { name: 'Up three levels' }).click()
    await expect(page).toHaveURL('/')
  })
})
