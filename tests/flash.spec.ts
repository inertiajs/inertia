import { expect, test } from '@playwright/test'
import { gotoPageAndWaitForContent, requests } from './support'

const waitForMessages = async (page, count?: number): Promise<any[]> => {
  if (typeof count === 'number') {
    await page.waitForFunction((count) => (window as any).messages.length === count, count)
  }

  return await page.evaluate(() => (window as any).messages)
}

test.describe('Flash Data', () => {
  test('displays flash data from initial page load', async ({ page }) => {
    await page.goto('/flash/initial')
    await expect(page.locator('#flash')).toContainText('Hello from server')
  })

  test('fires flash event on initial page load for global listeners', async ({ page }) => {
    await page.goto('/flash/initial')
    await expect(page.locator('#flash-events')).toContainText('Hello from server')
  })

  test('preserves flash data after deferred props load and does not fire event again', async ({ page }) => {
    // Set up response listener before navigating to catch the deferred request
    const deferredResponse = page.waitForResponse((res) => res.url().includes('/flash/with-deferred'))

    await gotoPageAndWaitForContent(page, '/flash/with-deferred')

    await expect(page.locator('#flash')).toContainText('Flash with deferred')
    await expect(page.locator('#flash-event-count')).toHaveText('1')

    // Wait for deferred data to load (may already be loaded in fast CI environments)
    await deferredResponse

    await expect(page.locator('#loading')).not.toBeVisible()
    await expect(page.locator('#data')).toContainText('Deferred data loaded')
    await expect(page.locator('#flash')).toContainText('Flash with deferred')
    await expect(page.locator('#flash-event-count')).toHaveText('1')
  })

  test('preserves flash data and fires event when page has InfiniteScroll', async ({ page }) => {
    await page.goto('/')

    await page.evaluate(() => window.testing.Inertia.visit('/flash/with-infinite-scroll'))
    await page.waitForURL('**/flash/with-infinite-scroll')

    await expect(page.locator('#flash')).toContainText('Flash with infinite scroll')
    await expect(page.locator('#flash-event-count')).toHaveText('1')
  })

  test('fires flash event on partial request when flash is unchanged', async ({ page }) => {
    await page.goto('/flash/partial')

    await expect(page.locator('#flash')).toContainText('Initial flash')
    await expect(page.locator('#flash-event-count')).toHaveText('1')

    const responsePromise = page.waitForResponse((res) => res.url().includes('/flash/partial'))
    await page.getByRole('button', { name: 'Reload with same flash' }).click()
    await responsePromise

    await expect(page.locator('#flash')).toContainText('Initial flash')
    await expect(page.locator('#flash-event-count')).toHaveText('2')
  })

  test('fires flash event on partial request when flash changes', async ({ page }) => {
    await page.goto('/flash/partial')

    await expect(page.locator('#flash')).toContainText('Initial flash')
    await expect(page.locator('#flash-event-count')).toHaveText('1')

    const responsePromise = page.waitForResponse((res) => res.url().includes('/flash/partial'))
    await page.getByRole('button', { name: 'Reload with different flash' }).click()
    await responsePromise

    await expect(page.locator('#flash')).toContainText('Updated flash')
    await expect(page.locator('#flash-event-count')).toHaveText('2')
  })

  test.describe('Requests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/flash/events')
    })

    test('receives flash data and fires event callbacks', async ({ page }) => {
      await page.getByRole('link', { name: 'Visit with flash' }).click()

      const messages = await waitForMessages(page, 8)

      expect(messages).toEqual([
        'Inertia.on(flash)',
        { foo: 'bar' },
        'addEventListener(inertia:flash)',
        { foo: 'bar' },
        'onFlash',
        { foo: 'bar' },
        'onSuccess',
        { foo: 'bar' },
      ])
    })

    test('flash data is not persisted in browser history', async ({ page }) => {
      await page.getByRole('link', { name: 'Visit with flash' }).click()
      await waitForMessages(page, 8)

      const flashBefore = await page.locator('#flash').textContent()
      expect(flashBefore).toContain('foo')

      await page.getByRole('link', { name: 'Navigate away' }).click()
      await page.waitForURL('/')

      await page.goBack()
      expect(page.url()).toContain('/flash/events')

      const flashAfter = await page.locator('#flash').textContent()
      expect(flashAfter).toBe('{}')
    })

    test('does not fire flash event when no flash data is present', async ({ page }) => {
      await page.getByRole('link', { name: 'Visit without flash' }).click()

      const messages = await waitForMessages(page, 1)

      expect(messages).toEqual(['onSuccess'])
    })
  })

  test.describe('Client-side visits', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/flash/client-side-visits')
    })

    test('sets flash data and fires onFlash callback', async ({ page }) => {
      requests.listen(page)

      await expect(page.locator('#flash')).toHaveText('{}')

      await page.getByRole('button', { name: 'With flash object' }).click()

      await expect(page.locator('#flash')).toContainText('foo')
      expect(await page.evaluate(() => window.flashCount)).toBe(1)
      expect(requests.requests.length).toBe(0)
    })

    test('merges flash data using function', async ({ page }) => {
      requests.listen(page)

      await page.getByRole('button', { name: 'With flash object' }).click()
      await expect(page.locator('#flash')).toContainText('foo')

      await page.getByRole('button', { name: 'With flash function' }).click()

      const flashText = await page.locator('#flash').textContent()
      expect(flashText).toContain('foo')
      expect(flashText).toContain('bar')
      expect(flashText).toContain('baz')
      expect(await page.evaluate(() => window.flashCount)).toBe(2)
      expect(requests.requests.length).toBe(0)
    })

    test('flash data does not carry over to next client-side visit', async ({ page }) => {
      requests.listen(page)

      await page.getByRole('button', { name: 'With flash object' }).click()
      await expect(page.locator('#flash')).toContainText('foo')

      await page.getByRole('button', { name: 'Without flash' }).click()

      await expect(page.locator('#flash')).toHaveText('{}')
      expect(await page.evaluate(() => window.flashCount)).toBe(1)
      expect(requests.requests.length).toBe(0)
    })
  })

  test.describe('router.flash()', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/flash/router-flash')
    })

    test('sets flash data with object', async ({ page }) => {
      requests.listen(page)

      await expect(page.locator('#flash')).toHaveText('{}')

      await page.getByRole('button', { name: 'Set flash', exact: true }).click()

      await expect(page.locator('#flash')).toContainText('foo')
      expect(requests.requests.length).toBe(0)
    })

    test('sets flash data with key-value pair', async ({ page }) => {
      requests.listen(page)

      await expect(page.locator('#flash')).toHaveText('{}')

      await page.getByRole('button', { name: 'Set flash key-value' }).click()

      await expect(page.locator('#flash')).toContainText('foo')
      await expect(page.locator('#flash')).toContainText('bar')
      expect(requests.requests.length).toBe(0)
    })

    test('merges flash data using function', async ({ page }) => {
      requests.listen(page)

      await page.getByRole('button', { name: 'Set flash', exact: true }).click()
      await expect(page.locator('#flash')).toContainText('foo')

      await page.getByRole('button', { name: 'Merge flash' }).click()

      const flashText = await page.locator('#flash').textContent()
      expect(flashText).toContain('foo')
      expect(flashText).toContain('bar')
      expect(flashText).toContain('baz')
      expect(requests.requests.length).toBe(0)
    })

    test('clears flash data using function', async ({ page }) => {
      requests.listen(page)

      await page.getByRole('button', { name: 'Set flash', exact: true }).click()
      await expect(page.locator('#flash')).toContainText('foo')

      await page.getByRole('button', { name: 'Clear flash' }).click()

      await expect(page.locator('#flash')).toHaveText('{}')
      expect(requests.requests.length).toBe(0)
    })
  })
})
