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

  test('it uses all defaults when page does not set any layout props', async ({ page }) => {
    await page.goto('/layout-props/default')

    await expect(page.locator('.app-title')).toHaveText('Default Title')
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'light')

    // Navigate to a page with static overrides
    await page.getByRole('link', { name: 'Go to Static Page' }).click()

    await expect(page).toHaveURL('/layout-props/static')
    await expect(page.locator('.app-title')).toHaveText('Static Props Page')
    await expect(page.locator('.sidebar')).not.toBeVisible()
    await expect(page.locator('.app-layout')).toHaveAttribute('data-theme', 'dark')
  })

  test('it preserves named layout instances across navigations', async ({ page }) => {
    await page.goto('/layout-props/persistent-a')

    await expect(page.locator('.app-title')).toHaveText('Persistent Page A')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-padding', 'lg')

    const appLayoutId = await page.evaluate(() => window._inertia_app_layout_id)
    const contentLayoutId = await page.evaluate(() => window._inertia_content_layout_id)
    await expect(appLayoutId).toBeDefined()
    await expect(contentLayoutId).toBeDefined()

    await page.getByRole('link', { name: 'Go to Page B' }).click()

    await expect(page).toHaveURL('/layout-props/persistent-b')
    await expect(page.locator('.app-title')).toHaveText('Persistent Page B')
    await expect(page.locator('.content-layout')).toHaveAttribute('data-padding', 'xl')

    const appLayoutIdAfter = await page.evaluate(() => window._inertia_app_layout_id)
    const contentLayoutIdAfter = await page.evaluate(() => window._inertia_content_layout_id)
    await expect(appLayoutIdAfter).toEqual(appLayoutId)
    await expect(contentLayoutIdAfter).toEqual(contentLayoutId)
  })
})
