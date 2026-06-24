import { expect, Page, test } from '@playwright/test'
import { clickAndWaitForResponse } from './support'

async function getInertiaHeadHTML(page: Page) {
  return await page.evaluate(() => {
    const inertiaElements = Array.from(document.querySelector('head').querySelectorAll('[data-inertia]'))

    return inertiaElements.map((el) => el.outerHTML).join('')
  })
}

test.describe('server head', () => {
  test('it renders server-provided head elements on initial load', async ({ page }) => {
    await page.goto('/server-head?withServerHead')
    await page.waitForSelector('title[data-inertia="server-head-0"]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<title data-inertia="server-head-0">Server Head Initial</title>' +
        '<meta data-inertia="server-head-1" name="description" content="Initial server head description">',
    )
  })

  test('it reconciles server head elements by their explicit data-inertia key across navigation', async ({ page }) => {
    await page.goto('/server-head/keyed?withServerHead')
    await page.waitForFunction(
      () => document.querySelector('title[data-inertia="title"]')?.textContent === 'Keyed Head A',
    )

    const description = page.locator('meta[name="description"]')
    const robots = page.locator('meta[name="robots"]')
    const canonical = page.locator('link[rel="canonical"]')

    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('data-inertia', 'description')
    await expect(description).toHaveAttribute('content', 'Keyed description A')
    await expect(canonical).toHaveAttribute('href', 'https://example.com/a')
    await expect(robots).toHaveCount(0)

    await clickAndWaitForResponse(page, 'Next server head page', '/server-head/keyed/next')
    await page.waitForFunction(
      () => document.querySelector('title[data-inertia="title"]')?.textContent === 'Keyed Head B',
    )

    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('content', 'Keyed description B')
    await expect(robots).toHaveCount(1)
    await expect(robots).toHaveAttribute('content', 'noindex')
    await expect(canonical).toHaveAttribute('href', 'https://example.com/b')

    await clickAndWaitForResponse(page, 'Next server head page', '/server-head/keyed')
    await page.waitForFunction(
      () => document.querySelector('title[data-inertia="title"]')?.textContent === 'Keyed Head A',
    )

    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('content', 'Keyed description A')
    await expect(canonical).toHaveAttribute('href', 'https://example.com/a')
    await expect(robots).toHaveCount(0)
  })

  test('it builds head elements from a callback when serverHead is a function', async ({ page }) => {
    await page.goto('/server-head?withServerHeadCallback')
    await page.waitForSelector('title[data-inertia="server-head-0"]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<title data-inertia="server-head-0">Server Head Initial</title>' +
        '<meta data-inertia="server-head-1" name="description" content="Initial server head description">',
    )
  })

  test('it reads server head elements from a custom prop name', async ({ page }) => {
    await page.goto('/server-head/custom-prop?withServerHeadProp')
    await page.waitForSelector('title[data-inertia="server-head-0"]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<title data-inertia="server-head-0">Custom Prop Head</title>' +
        '<meta data-inertia="server-head-1" name="description" content="Custom prop description">',
    )
  })

  test('it keeps server head elements after a partial reload that omits the head prop', async ({ page }) => {
    await page.goto('/server-head?withServerHead')
    await page.waitForSelector('title[data-inertia="server-head-0"]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    const foo = await page.locator('#foo').textContent()
    const response = page.waitForResponse(
      (response) =>
        response.url().includes('/server-head') &&
        response.request().headers()['x-inertia-partial-data'] === 'foo' &&
        response.status() === 200,
    )

    await page.getByRole('button', { exact: true, name: 'Reload foo' }).click()
    await response

    await expect(page.locator('#foo')).not.toHaveText(foo!)
    expect(await getInertiaHeadHTML(page)).toBe(headHTML)
  })

  test('it lets page head elements override server head elements with the same key', async ({ page }) => {
    test.skip(process.env.PACKAGE === 'svelte', 'Svelte has no Head component; it uses native <svelte:head>')

    await page.goto('/server-head?withServerHead&override')
    await page.waitForSelector('title[data-inertia="server-head-0"]', { state: 'attached' })

    const description = page.locator('meta[name="description"]')

    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('data-inertia', 'description')
    await expect(description).toHaveAttribute('content', 'Page override')

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<title data-inertia="server-head-0">Server Head Initial</title>' +
        '<meta name="description" content="Page override" data-inertia="description">',
    )
  })
})
