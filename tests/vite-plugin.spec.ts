import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test.describe('Vite Plugin Transforms', () => {
  test.describe('pages shorthand transform', () => {
    test('it resolves pages from the configured directory', async ({ page }) => {
      // app-auto.ts uses pages: './VitePages' (not ./Pages)
      // This proves the transform uses our configured path
      await page.goto('/auto')

      await expect(page.getByTestId('vite-title')).toHaveText('Vite Plugin Test Page')
      await expect(page.getByTestId('vite-example')).toHaveText('Example: AutoTransform')
    })

    test('it loads nested pages with props', async ({ page }) => {
      await page.goto('/auto/props')

      await expect(page.getByTestId('props-title')).toHaveText('Vite Props Page')
      await expect(page.getByTestId('foo')).toHaveText('foo: vite-bar')
      await expect(page.getByTestId('count')).toHaveText('count: 123')
      await expect(page.getByTestId('items')).toHaveText('items: vite, plugin, test')
    })

    test('it handles client-side navigation without page reload', async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/auto')
      await expect(page.getByTestId('vite-title')).toHaveText('Vite Plugin Test Page')

      await page.getByTestId('props-link').click()
      await expect(page.getByTestId('props-title')).toHaveText('Vite Props Page')

      await page.getByTestId('home-link').click()
      await expect(page.getByTestId('vite-title')).toHaveText('Vite Plugin Test Page')

      expect(pageLoads.count).toBe(1)
    })
  })
})
