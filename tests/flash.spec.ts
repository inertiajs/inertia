import { expect, test } from '@playwright/test'
import { requests } from './support'

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
      expect(flashAfter).toBe('no-flash')
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

      await expect(page.locator('#flash')).toHaveText('no-flash')

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

      await expect(page.locator('#flash')).toHaveText('no-flash')
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

      await expect(page.locator('#flash')).toHaveText('no-flash')

      await page.getByRole('button', { name: 'Set flash', exact: true }).click()

      await expect(page.locator('#flash')).toContainText('foo')
      expect(requests.requests.length).toBe(0)
    })

    test('sets flash data with key-value pair', async ({ page }) => {
      requests.listen(page)

      await expect(page.locator('#flash')).toHaveText('no-flash')

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

      await expect(page.locator('#flash')).toHaveText('no-flash')
      expect(requests.requests.length).toBe(0)
    })
  })
})
