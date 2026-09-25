import { expect, type Route, test } from '@playwright/test'
import { consoleMessages, requests } from './support'

test.describe('HTTP cancellation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visits/method')
  })

  test('rejects an already-aborted signal without sending a request', async ({ page }) => {
    requests.listen(page)

    const result = await page.evaluate(async () => {
      const http = window.testingHttp
      const controller = new AbortController()
      const errors: string[] = []
      const off = http.onError((error) => {
        errors.push(error.name)
      })
      controller.abort()
      try {
        await http.getClient().request({ method: 'get', url: '/dump/get', signal: controller.signal })
        return { outcome: 'resolved', errors }
      } catch (error) {
        return { outcome: (error as Error).name, errors }
      } finally {
        off()
      }
    })

    expect(result).toEqual({ outcome: 'HttpCancelledError', errors: ['HttpCancelledError'] })
    expect(requests.requests.filter((request) => request.url().includes('/dump/get'))).toEqual([])
  })

  test('rejects cancellation during asynchronous request preparation', async ({ page }) => {
    requests.listen(page)

    const result = await page.evaluate(async () => {
      const http = window.testingHttp
      const controller = new AbortController()
      let release!: () => void
      let entered!: () => void
      const blocked = new Promise<void>((resolve) => {
        release = resolve
      })
      const started = new Promise<void>((resolve) => {
        entered = resolve
      })
      const off = http.onRequest(async (config) => {
        entered()
        await blocked
        return config
      })
      const response = http
        .getClient()
        .request({ method: 'get', url: '/dump/get', signal: controller.signal })
        .then(
          () => 'resolved',
          (error) => error.name,
        )
      await started
      controller.abort()
      release()
      try {
        return await response
      } finally {
        off()
      }
    })

    expect(result).toBe('HttpCancelledError')
    expect(requests.requests.filter((request) => request.url().includes('/dump/get'))).toEqual([])
  })

  test('still aborts a request after it has started', async ({ page }) => {
    let intercepted!: () => void
    const started = new Promise<void>((resolve) => {
      intercepted = resolve
    })
    await page.route('**/dump/get', () => {
      intercepted()
    })
    const response = page.evaluate(async () => {
      const http = window.testingHttp
      const controller = new AbortController()
      ;(window as any).cancelRequest = () => controller.abort()
      try {
        await http.getClient().request({ method: 'get', url: '/dump/get', signal: controller.signal })
        return 'resolved'
      } catch (error) {
        return (error as Error).name
      }
    })
    await started
    await page.evaluate(() => (window as any).cancelRequest())
    expect(await response).toBe('HttpCancelledError')
  })

  test('does not apply a visit cancelled before its XHR is created', async ({ page }) => {
    let oldRequest: Route | undefined
    await page.route('**/dump/get?request=old', (route) => {
      oldRequest = route
    })
    requests.listen(page)
    consoleMessages.listen(page)

    const result = await page.evaluate(async () => {
      const router = window.testing.Inertia
      const callbacks: string[] = []
      ;(window as any).cancelledCallbacks = callbacks
      let cancel!: () => void
      router.visit('/dump/get?request=old', {
        async: true,
        onCancelToken: (token) => {
          cancel = token.cancel
        },
        onCancel: () => {
          callbacks.push('cancel')
        },
        onFinish: () => {
          callbacks.push('finish')
        },
        onSuccess: () => {
          callbacks.push('success')
        },
      })
      cancel()
      const accepted = await new Promise<{ url: string; query: unknown }>((resolve) => {
        router.visit('/dump/get?request=current', {
          async: true,
          onSuccess: (page) => resolve({ url: page.url, query: page.props.query }),
        })
      })
      return accepted
    })

    expect(result).toEqual({ url: '/dump/get?request=current', query: { request: 'current' } })
    if (oldRequest) {
      await oldRequest.continue()
      await page.waitForFunction(() => (window as any).cancelledCallbacks.includes('success'))
    }
    const applied = await page.evaluate(
      () =>
        new Promise<{ url: string; query: unknown }>((resolve) => {
          window.testing.Inertia.reload({
            preserveUrl: true,
            data: { request: 'current' },
            onSuccess: (page) => resolve({ url: page.url, query: page.props.query }),
          })
        }),
    )

    expect(applied).toEqual({ url: '/dump/get?request=current', query: { request: 'current' } })
    expect(await page.evaluate(() => (window as any).cancelledCallbacks)).toEqual(['cancel', 'finish'])
    await expect(page).toHaveURL('/dump/get?request=current')
    expect(
      requests.requests
        .filter((request) => request.url().includes('/dump/get'))
        .map((request) => new URL(request.url()).search),
    ).not.toContain('?request=old')
    expect(consoleMessages.errors).toEqual([])
  })

  test('does not send a prefetch cancelled before its XHR is created', async ({ page }) => {
    requests.listen(page)
    const result = await page.evaluate(async () => {
      const http = window.testingHttp
      const router = window.testing.Inertia
      let settle!: (outcome: string) => void
      const outcome = new Promise<string>((resolve) => {
        settle = resolve
      })
      const offError = http.onError((error) => {
        settle(error.name)
      })
      const offResponse = http.onResponse((response) => {
        settle('resolved')
        return response
      })
      router.prefetch('/dump/get?request=prefetch', { onCancelToken: (token) => token.cancel() })
      try {
        return await outcome
      } finally {
        offError()
        offResponse()
      }
    })
    expect(result).toBe('HttpCancelledError')
    expect(requests.requests.filter((request) => request.url().includes('/dump/get'))).toEqual([])
  })
})
