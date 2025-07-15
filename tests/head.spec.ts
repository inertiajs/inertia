import { expect, test } from '@playwright/test'

test('renders the title tag and children', async ({ page }) => {
  test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')

  await page.goto('/head')

  const inertiaTitle = await page.evaluate(() => document.querySelector('title[data-inertia]')?.textContent)

  await expect(inertiaTitle).toBe('Test Head Component')
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'This is an "escape" example')
})
