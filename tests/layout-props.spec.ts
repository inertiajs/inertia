import { expect, test } from '@playwright/test'

test.describe('layout props', () => {
  test('it can set layout props dynamically with setLayoutProps', async ({ page }) => {
    await page.goto('/layout-props/basic')

    await expect(page.locator('.app-title')).toHaveText('Basic Layout Props')
    await expect(page.locator('.sidebar')).toBeVisible()

    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()

    await expect(page.locator('.sidebar')).not.toBeVisible()

    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()

    await expect(page.locator('.sidebar')).toBeVisible()
  })

  test('it can pass static props via tuple syntax', async ({ page }) => {
    await page.goto('/layout-props/static')

    await expect(page.locator('.app-title')).toHaveText('Static Props Page')
    await expect(page.locator('.sidebar')).not.toBeVisible()
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'dark')
  })

  test('it can target specific layouts with named layouts and setLayoutPropsFor', async ({ page }) => {
    await page.goto('/layout-props/named')

    await expect(page.locator('.app-title')).toHaveText('Named Layouts Page')
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-padding', 'xl')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-max-width', '2xl')
  })

  test('it resets layout props on navigation', async ({ page }) => {
    await page.goto('/layout-props/navigate')

    await expect(page.locator('.app-title')).toHaveText('Navigate Page')
    await expect(page.locator('.sidebar')).not.toBeVisible()
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('link', { name: 'Go to Basic Page' }).click()

    await expect(page).toHaveURL('/layout-props/basic')
    await expect(page.locator('.app-title')).toHaveText('Basic Layout Props')
    await expect(page.locator('.sidebar')).toBeVisible()
  })

  test('it supports nested layouts with static props in tuple format', async ({ page }) => {
    await page.goto('/layout-props/nested')

    await expect(page.locator('.app-title')).toHaveText('Nested Layouts')
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-padding', 'lg')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-max-width', 'xl')
  })

  test('it supports named layouts with both static and dynamic props', async ({ page }) => {
    await page.goto('/layout-props/named-static')

    await expect(page.locator('.app-title')).toHaveText('Named Layouts with Static Props')
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-padding', 'sm')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-max-width', '4xl')
  })

  test('it uses defaults when no props are set', async ({ page }) => {
    await page.goto('/layout-props/basic')

    // The layout has defaults: title: 'Default Title', showSidebar: true, theme: 'light'
    // But the page overrides title and showSidebar, so theme should still be 'light' (default)
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'light')
  })
})
