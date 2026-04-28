import { expect, test } from '@playwright/test'

test('it applies the default layout to pages without their own layout', async ({ page }) => {
  await page.goto('/default-layout?withDefaultLayout')

  await expect(page.locator('#default-layout')).toBeVisible()
  await expect(page.getByText('Default Layout')).toBeVisible()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')
})

test('it does not apply the default layout when visiting without the layout option', async ({ page }) => {
  await page.goto('/default-layout')

  await expect(page.locator('#default-layout')).not.toBeVisible()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')
})

test('it lets page layout take precedence over the default layout', async ({ page }) => {
  await page.goto('/default-layout/with-own-layout?withDefaultLayout')

  await expect(page.locator('#default-layout')).not.toBeVisible()
  await expect(page.locator('#page-layout')).toBeVisible()
  await expect(page.getByText('Page Layout')).toBeVisible()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/WithOwnLayout')
})

test('it applies the default layout after navigating to a page without its own layout', async ({ page }) => {
  await page.goto('/default-layout/with-own-layout?withDefaultLayout')

  await expect(page.locator('#page-layout')).toBeVisible()

  await page.getByRole('link', { name: 'Back to Index' }).click()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')

  await expect(page.locator('#default-layout')).toBeVisible()
  await expect(page.locator('#page-layout')).not.toBeVisible()
})

test('it supports anonymous arrow functions as layout components', async ({ page }) => {
  test.skip(process.env.PACKAGE !== 'react', 'React-only test')

  await page.goto('/default-layout?withAnonymousDefaultLayout')

  await expect(page.locator('#default-layout')).toBeVisible()
  await expect(page.getByText('Default Layout')).toBeVisible()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')
})

test.describe('react layouts', () => {
  test.skip(process.env.PACKAGE !== 'react', 'React-only')

  test('it renders arrow function components assigned directly to Page.layout', async ({ page }) => {
    await page.goto('/default-layout/with-arrow-component-layout')

    await expect(page.locator('#arrow-layout')).toBeVisible()
    await expect(page.getByText('Arrow Layout')).toBeVisible()
    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithArrowComponentLayout')
  })

  test('it supports renderLayout() for arrow function render functions', async ({ page }) => {
    await page.goto('/default-layout/with-render-layout')

    await expect(page.locator('#page-layout')).toBeVisible()
    await expect(page.getByText('Page Layout')).toBeVisible()
    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithRenderLayout')
  })

  test('it supports renderLayout() with page.props access', async ({ page }) => {
    await page.goto('/default-layout/with-render-layout-page-props')

    await expect(page.locator('#props-layout')).toBeVisible()
    await expect(page.locator('#props-layout')).toHaveAttribute('data-title', 'Hello from Props')
    await expect(page.locator('#layout-title')).toHaveText('Hello from Props')
    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithRenderLayoutPageProps')
  })
})

test('it supports a callback that conditionally returns a layout', async ({ page }) => {
  await page.goto('/default-layout?withDefaultLayoutCallback')

  await expect(page.locator('#default-layout')).toBeVisible()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')

  await page.getByRole('link', { name: 'Callback Excluded' }).click()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/CallbackExcluded')

  await expect(page.locator('#default-layout')).not.toBeVisible()
})
