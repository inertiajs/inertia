import { expect, test } from '@playwright/test'

test.describe('usePage', () => {
  test.skip(process.env.PACKAGE !== 'vue3' && process.env.PACKAGE !== 'svelte')

  test('returns the same instance on multiple calls', async ({ page }) => {
    await page.goto('/use-page/page1')

    await expect(page.getByTestId('same-ref')).toContainText('yes')
  })

  test('exposes reactive page props', async ({ page }) => {
    await page.goto('/use-page/page1')

    await expect(page.getByTestId('name-props')).toContainText('Alice')
    await expect(page.getByTestId('name-usepage')).toContainText('Alice')
    await expect(page.getByTestId('url')).toContainText('/use-page/page1')
  })

  test('exposes reactive page data in child components', async ({ page }) => {
    await page.goto('/use-page/page1')

    await expect(page.getByTestId('child-url')).toContainText('/use-page/page1')
    await expect(page.getByTestId('child-component')).toContainText('UsePage/Page1')
  })

  test('returns the same instance in parent and child components', async ({ page }) => {
    await page.goto('/use-page/page1')

    await expect(page.getByTestId('child-same-ref')).toContainText('yes')
  })

  test('updates reactively after SPA navigation', async ({ page }) => {
    await page.goto('/use-page/page1')

    await expect(page.getByTestId('name-usepage')).toContainText('Alice')

    await page.getByTestId('go-page2').click()
    await expect(page.getByTestId('title-props')).toContainText('Dashboard')
    await expect(page.getByTestId('title-usepage')).toContainText('Dashboard')
    await expect(page.getByTestId('url')).toContainText('/use-page/page2')
    await expect(page.getByTestId('child-url')).toContainText('/use-page/page2')
    await expect(page.getByTestId('child-component')).toContainText('UsePage/Page2')
    await expect(page.getByTestId('same-ref')).toContainText('yes')
  })
})
