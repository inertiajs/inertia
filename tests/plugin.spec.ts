import { expect, test } from '@playwright/test'

test.describe('plugin', () => {
  test.skip(process.env.PACKAGE !== 'vue3')

  test.describe('$page helper', () => {
    test('has the helper injected into the Vue component', async ({ page }) => {
      await page.goto('/')

      const initialPage = await page.evaluate(() => (window as any).initialPage)
      const $page = await page.evaluate(() => (window as any)._plugin_global_props.$page)
      await expect(initialPage).not.toBeNull()
      await expect($page).toEqual(initialPage)
    })

    test('misses the helper when not registered', async ({ page }) => {
      await page.goto('/plugin/without')

      const $page = await page.evaluate(() => (window as any)._plugin_global_props.$page)
      await expect($page).toBeUndefined()
    })
  })

  test.describe('$inertia helper', () => {
    test('has the helper injected into the Vue component', async ({ page }) => {
      await page.goto('/')

      const $inertia = await page.evaluate(() => (window as any)._plugin_global_props.$inertia)
      const Inertia = await page.evaluate(() => (window as any).testing.Inertia)
      await expect($inertia).not.toBeNull()
      await expect($inertia).toEqual(Inertia)
    })

    test('misses the helper when not registered', async ({ page }) => {
      await page.goto('/plugin/without')

      const $inertia = await page.evaluate(() => (window as any)._plugin_global_props.$inertia)
      await expect($inertia).toBeUndefined()
    })
  })
})
