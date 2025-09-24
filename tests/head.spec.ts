import { expect, test } from '@playwright/test'

test('renders the title tag and children', async ({ page }) => {
  test.skip(
    process.env.PACKAGE === 'svelte' || process.env.PACKAGE === 'svelte5',
    'Svelte adapter has no Head component',
  )

  await page.goto('/head')

  await page.waitForSelector('title[inertia]', { state: 'attached' })
  const inertiaTitle = await page.evaluate(() => document.querySelector('title[inertia]')?.textContent)

  await expect(inertiaTitle).toBe('Test Head Component')
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'This is an "escape" example')
  await expect(page.locator('meta[name="number"]')).toHaveAttribute('content', '0')
  await expect(page.locator('meta[name="boolean"]')).toHaveAttribute('content', 'true')
  await expect(page.locator('meta[name="false"]')).toHaveAttribute('content', 'false')
  await expect(page.locator('meta[name="null"]')).toHaveAttribute('content', 'null')
  await expect(page.locator('meta[name="undefined"]')).toHaveAttribute('content', 'undefined')
  await expect(page.locator('meta[name="float"]')).toHaveAttribute('content', '3.14')
})
