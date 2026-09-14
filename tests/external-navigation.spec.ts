import { expect, test } from '@playwright/test'
import type { interceptors } from '../packages/core/src/interceptors'

test('loads deferred and optional props without changing host history', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await expect(page.getByText('Details for report 1', { exact: true })).toBeVisible()

  const historyLength = await page.evaluate(() => history.length)

  await page.getByRole('button', { name: 'Load optional summary' }).click()

  await expect(page.getByText('Summary for report 1', { exact: true })).toBeVisible()
  await expect(page.getByText('Total: 100', { exact: true })).toBeVisible()
  await expect(page).toHaveURL('/external-navigation/1')
  expect(await page.evaluate(() => history.state)).toEqual({ host: true })
  expect(await page.evaluate(() => history.length)).toBe(historyLength)
  expect(await page.evaluate(() => history.scrollRestoration)).toBe('auto')
})

test('validates and saves a form inside the host page', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await page.getByRole('button', { name: 'Save report', exact: true }).click()

  await expect(page.getByText('The name field is required.')).toBeVisible()

  await page.getByLabel('Name', { exact: true }).fill('Monthly revenue')
  await page.getByRole('button', { name: 'Save report', exact: true }).click()

  await expect(page.getByText('Total: 150', { exact: true })).toBeVisible()
  await expect(page.getByText('Flash: Report saved', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save report', exact: true })).toBeEnabled()
  await expect(page).toHaveURL('/external-navigation/1')
  expect(await page.evaluate(() => history.state)).toEqual({ host: true })
})

test('delegates links and back navigation to the host and restores remembered form data', async ({ page }) => {
  await page.goto('/external-navigation/1')

  const requests: string[] = []

  page.on('request', (request) => {
    if (request.url().endsWith('/external-navigation/2') && !request.headers()['x-inertia-partial-data']) {
      requests.push(request.url())
    }
  })

  await page.getByLabel('Name', { exact: true }).fill('Unfinished report')
  await page.getByRole('link', { name: 'Next report', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
  expect(requests).toHaveLength(1)
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('')
  expect(await page.evaluate(() => history.state)).toEqual({ host: true })

  await page.goBack()

  await expect(page.getByRole('heading', { name: 'Report 1', exact: true })).toBeVisible()
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Unfinished report')
})

test('hands server location responses and excluded links to the host', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await page.getByRole('button', { name: 'Save and open next report' }).click()

  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
  await expect(page).toHaveURL('/external-navigation/2')

  await page.getByRole('link', { name: 'Leave application' }).click()

  await expect(page.getByRole('heading')).toHaveText('This is a page that does not have the Inertia app loaded.')
})

test('hands an ordinary POST destination to the host after response callbacks', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await page.getByRole('button', { name: 'Save with ordinary response' }).click()

  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
  await expect(page.locator('body')).toHaveAttribute('data-navigation-order', 'flash,success,navigate,')
})

for (const destination of ['destination', 'redirect']) {
  test(`completes a ${destination} request when the host disposes its mount`, async ({ page }) => {
    await page.goto('/external-navigation/1')

    await page.evaluate((destination) => {
      window.testing.Inertia.post(
        `/external-navigation/1/${destination}`,
        {},
        {
          onCancel: () => {
            document.body.dataset.cancelled = 'true'
          },
          onFinish: ({ completed, cancelled, interrupted }) => {
            document.body.dataset.finished = JSON.stringify({ completed, cancelled, interrupted })
            document.body.dataset.finishCount = String(Number(document.body.dataset.finishCount || 0) + 1)
          },
        },
      )
    }, destination)

    await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
    await expect(page.locator('body')).not.toHaveAttribute('data-cancelled')
    await expect(page.locator('body')).toHaveAttribute('data-finish-count', '1')
    await expect(page.locator('body')).toHaveAttribute(
      'data-finished',
      JSON.stringify({ completed: true, cancelled: false, interrupted: false }),
    )
  })
}

test('hands the intercepted destination to the host exactly once', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await page.evaluate(() => {
    const registry = (window as Window & { __inertia_interceptors__: typeof interceptors }).__inertia_interceptors__

    registry.onVisitResponse((visit, response) => {
      if (!visit.url.pathname.endsWith('/destination')) {
        return response
      }

      document.body.dataset.interceptions = String(Number(document.body.dataset.interceptions || 0) + 1)
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data

      return { ...response, data: { ...data, url: '/external-navigation/3' } }
    })
  })

  await page.getByRole('button', { name: 'Save with ordinary response' }).click()

  await expect(page.getByRole('heading', { name: 'Report 3', exact: true })).toBeVisible()
  await expect(page.locator('body')).toHaveAttribute('data-interceptions', '1')
  await expect(page.locator('body')).toHaveAttribute('data-navigation-order', 'flash,success,navigate,')
})

test('keeps local props local when the host URL differs and delegates URL-changing pushes', async ({ page }) => {
  await page.goto('/external-navigation/1')
  await page.evaluate(() => history.replaceState({ host: true }, '', '/external-navigation/host-shell'))

  await page.getByRole('button', { name: 'Replace total locally' }).click()

  await expect(page.getByText('Total: 999', { exact: true })).toBeVisible()
  await expect(page).toHaveURL('/external-navigation/host-shell')

  await page.getByRole('button', { name: 'Push next report' }).click()

  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
  await expect(page).toHaveURL('/external-navigation/2')
})

test('does not let a released component resolution overwrite a replacement mount', async ({ page }) => {
  let releaseResponse!: () => void
  const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

  await page.route('**/external-navigation/ready', async (route) => {
    await responseReleased
    await route.fulfill({ json: { ready: true } })
  })

  await page.goto('/external-navigation/1')

  await expect(page.getByText('Details for report 1', { exact: true })).toBeVisible()

  const componentRequest = page.waitForRequest('**/external-navigation/ready')

  await page.evaluate(() =>
    window.testing.Inertia.replace({ props: (props) => ({ ...props, waitForComponent: true }) }),
  )
  await componentRequest

  await page.getByRole('button', { name: 'Open second report' }).click()

  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()

  const componentResponse = page.waitForResponse('**/external-navigation/ready')

  releaseResponse()
  await componentResponse

  await page.getByRole('button', { name: 'Refresh total' }).click()

  await expect(page.getByText('Total: 201', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
})

test('discards dynamic layout props when a fresh external mount opens', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await expect(page.locator('.app-title')).toHaveText('Fresh layout')

  await page.getByRole('button', { name: 'Change layout' }).click()

  await expect(page.locator('.app-title')).toHaveText('Changed layout')

  await page.getByRole('button', { name: 'Open second report' }).click()

  await expect(page.locator('.app-title')).toHaveText('Fresh layout')
})

test('retires a queued server head update when its mount closes', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await expect(page).toHaveTitle('Report 1 head')

  await page.getByRole('button', { name: 'Queue head and close' }).click()

  await expect(page.locator('#app')).toBeEmpty()

  await page.waitForTimeout(20)

  await expect(page).toHaveTitle('Reports host')
  await expect(page.locator('title[data-inertia="external-report"]')).toHaveCount(0)
})

for (const setup of ['automatic', 'custom']) {
  test(`stops polling on ${setup} unmount and loads a replacement page`, async ({ page }) => {
    await page.goto(`/external-navigation/1${setup === 'custom' ? '?custom' : ''}`)

    await page.getByRole('button', { name: 'Start polling' }).click()
    await page.waitForRequest((request) => request.headers()['x-inertia-partial-data'] === 'total')

    await page.getByRole('button', { name: 'Close report' }).click()

    await expect(page.locator('#app')).toBeEmpty()

    const requests: string[] = []

    page.on('request', (request) => requests.push(request.url()))
    await page.waitForTimeout(300)

    expect(requests.filter((url) => url.includes('/external-navigation/1'))).toEqual([])

    await page.getByRole('button', { name: 'Open second report' }).click()

    await expect(page.getByText('Details for report 2', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Refresh total' }).click()

    await expect(page.getByText('Total: 201', { exact: true })).toBeVisible()
  })
}

test('does not restart an outgoing poll in a replacement mount', async ({ page }) => {
  await page.goto('/external-navigation/1')

  await expect(page.getByText('Details for report 1', { exact: true })).toBeVisible()

  await page.evaluate(() => {
    const poll = window.testing.Inertia.poll(
      50,
      () => {
        document.body.dataset.polled = 'true'

        return { only: ['total'] }
      },
      { autoStart: false },
    )

    document.addEventListener('restart-poll', () => poll.start(), { once: true })
  })

  await page.getByRole('button', { name: 'Open second report' }).click()

  await expect(page.getByText('Details for report 2', { exact: true })).toBeVisible()

  const requests: string[] = []

  page.on('request', (request) => requests.push(request.url()))
  await page.evaluate(() => document.dispatchEvent(new Event('restart-poll')))
  await page.waitForTimeout(300)

  expect(requests).toEqual([])
  await expect(page.locator('body')).not.toHaveAttribute('data-polled')
})

test('leaves an outgoing deferred request without overwriting the replacement page', async ({ page }) => {
  let releaseResponse!: () => void
  const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

  await page.route('**/external-navigation/1', async (route) => {
    if (route.request().headers()['x-inertia-partial-data'] !== 'details') {
      return route.continue()
    }

    const response = await route.fetch()

    await responseReleased
    await route.fulfill({ response })
  })

  await page.goto('/external-navigation/1')

  await expect(page.getByText('Loading details', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Open second report' }).click()

  await expect(page.getByText('Details for report 2', { exact: true })).toBeVisible()

  releaseResponse()
  await page.getByRole('button', { name: 'Refresh total' }).click()

  await expect(page.getByText('Total: 201', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
  await expect(page.getByText('Details for report 1', { exact: true })).not.toBeVisible()
})

test('loads more items without letting infinite scroll navigate the host', async ({ page }) => {
  await page.goto('/external-navigation/scroll')

  const container = page.getByTestId('scroll-container')

  await expect(page.locator('[data-user-id]')).toHaveCount(15)

  await container.evaluate((element) => element.scrollTo(0, element.scrollHeight))

  await expect(page.locator('[data-user-id]')).toHaveCount(30)

  await container.evaluate((element) => element.scrollTo(0, element.scrollHeight))

  await expect(page.locator('[data-user-id]')).toHaveCount(40)

  // The existing query-string synchronizer is debounced by 250 ms.
  await page.waitForTimeout(350)

  await expect(page).toHaveURL('/external-navigation/scroll')
  expect(await page.evaluate(() => history.state)).toEqual({ host: true })
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('preserves an item position when prepending inside a scroll container', async ({ page }) => {
  await page.goto('/external-navigation/scroll?page=3')

  const container = page.getByTestId('scroll-container')

  await expect(page.getByText('User 16', { exact: true })).toBeVisible()
  await expect(page.getByText('Loading more users...')).toBeHidden()

  await page.evaluate(() => {
    document.body.style.paddingBottom = '1000px'
    window.scrollTo(0, 100)
  })

  let releaseResponse!: () => void
  const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

  await page.route('**/external-navigation/scroll?page=1', async (route) => {
    const response = await route.fetch()

    await responseReleased
    await route.fulfill({ response })
  })

  const previousPageRequest = page.waitForRequest('**/external-navigation/scroll?page=1')

  await container.evaluate((element) => element.scrollTo(0, 0))
  await previousPageRequest

  const referenceItem = page.locator('[data-user-id="16"]')
  const initialTop = await referenceItem.evaluate((element) => element.getBoundingClientRect().top)

  releaseResponse()

  await expect(page.locator('[data-user-id="1"]')).toBeAttached()
  await expect
    .poll(() => referenceItem.evaluate((element) => element.getBoundingClientRect().top))
    .toBeCloseTo(initialTop, 0)
  expect(await page.evaluate(() => window.scrollY)).toBe(100)
  await expect(page).toHaveURL('/external-navigation/scroll?page=3')
  expect(await page.evaluate(() => history.state)).toEqual({ host: true })
})

test('processes a replacement request while an outgoing success callback is still pending', async ({ page }) => {
  let releaseResponse!: () => void
  const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

  await page.route('**/external-navigation/ready', async (route) => {
    await responseReleased
    await route.fulfill({ json: { ready: true } })
  })

  await page.goto('/external-navigation/1')

  await expect(page.getByText('Details for report 1', { exact: true })).toBeVisible()

  const confirmation = page.waitForRequest('**/external-navigation/ready')

  await page.evaluate(() => {
    window.testing.Inertia.reload({
      only: ['total'],
      onSuccess: async () => {
        await fetch('/external-navigation/ready')
      },
    })
  })
  await confirmation

  await page.getByRole('button', { name: 'Open second report' }).click()

  await expect(page.getByText('Details for report 2', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Refresh total' }).click()

  await expect(page.getByText('Total: 201', { exact: true })).toBeVisible()

  releaseResponse()
})

test('retains native success callbacks when a background response no longer matches the page', async ({ page }) => {
  let releaseResponse!: () => void
  const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

  await page.route('**/external-navigation/mutation', async (route) => {
    const response = await route.fetch()

    await responseReleased
    await route.fulfill({ response })
  })

  await page.goto('/external-navigation/1?native=1')

  await expect(page.getByText('Details for report 1', { exact: true })).toBeVisible()

  const mutation = page.waitForRequest('**/external-navigation/mutation')

  await page.evaluate(() => {
    window.testing.Inertia.post(
      '/external-navigation/mutation',
      { name: 'Saved' },
      {
        async: true,
        onSuccess: () => {
          document.body.dataset.saved = 'true'
        },
      },
    )
  })
  await mutation

  await page.getByRole('link', { name: 'Next report', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()

  releaseResponse()

  await expect(page.locator('body')).toHaveAttribute('data-saved', 'true')
  await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
})

test.describe('React rendering', () => {
  test.skip(process.env.PACKAGE !== 'react', 'React render and effect lifecycle')

  test('disposes the router when its resolver closes the scope during initialization', async ({ page }) => {
    const requests: string[] = []

    page.on('request', (request) => {
      if (request.headers()['x-inertia']) {
        requests.push(request.url())
      }
    })

    await page.goto('/external-navigation/1?custom&disposeDuringResolution')

    await expect(page.locator('body')).toHaveAttribute('data-disposed-during-resolution', 'true')

    await page.evaluate(() => window.testing.Inertia.reload({ only: ['total'] }))
    await page.waitForTimeout(300)

    expect(requests).toEqual([])
  })

  test('disposes a suspended custom mount before effects commit', async ({ page }) => {
    let releaseResponse!: () => void
    const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

    await page.route('**/external-navigation/ready', async (route) => {
      await responseReleased
      await route.fulfill({ json: { ready: true } })
    })

    await page.goto('/external-navigation/suspended?custom')

    await expect(page.getByText('Opening report details', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Open second report' }).click()

    await expect(page.getByText('Details for report 2', { exact: true })).toBeVisible()

    releaseResponse()
    await page.getByRole('button', { name: 'Refresh total' }).click()

    await expect(page.getByText('Total: 201', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Report 2', exact: true })).toBeVisible()
  })

  test('retains the newest flash and head when suspended rendering commits', async ({ page }) => {
    let releaseResponse!: () => void
    const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))

    await page.route('**/external-navigation/ready', async (route) => {
      await responseReleased
      await route.fulfill({ json: { ready: true } })
    })

    await page.goto('/external-navigation/suspended')

    await expect(page.getByText('Opening report details', { exact: true })).toBeVisible()

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          window.testing.Inertia.flash({ toast: { type: 'success', message: 'Old flash' } })
          window.testing.Inertia.replace({
            flash: { toast: { type: 'success', message: 'Newest flash' } },
            props: (props) => ({ ...props, head: ['<title data-inertia="external-report">Updated head</title>'] }),
            onFinish: () => resolve(),
          })
        }),
    )
    releaseResponse()

    await expect(page.getByText('Flash: Newest flash', { exact: true })).toBeVisible()
    await expect(page).toHaveTitle('Updated head')

    await page.evaluate(() => window.testing.Inertia.replaceProp('titleSuffix', 'Current page'))

    await expect(page).toHaveTitle('Updated head - Current page')
  })

  test('can replace a mount whose component failed to render', async ({ page }) => {
    await page.goto('/external-navigation/failed?custom')

    await expect(page.getByText('Unable to open report', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Open second report' }).click()

    await expect(page.getByText('Details for report 2', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Refresh total' }).click()

    await expect(page.getByText('Total: 201', { exact: true })).toBeVisible()
  })
})
