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

test('it supports a callback that conditionally returns a layout', async ({ page }) => {
  await page.goto('/default-layout?withDefaultLayoutCallback')

  await expect(page.locator('#default-layout')).toBeVisible()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')

  await page.getByRole('link', { name: 'Callback Excluded' }).click()
  await expect(page.locator('#text')).toHaveText('DefaultLayout/CallbackExcluded')

  await expect(page.locator('#default-layout')).not.toBeVisible()
})

test.describe('react layouts', () => {
  test.skip(process.env.PACKAGE !== 'react', 'React-only test')

  test('it supports anonymous arrow functions as layout components', async ({ page }) => {
    await page.goto('/default-layout?withAnonymousDefaultLayout')

    await expect(page.locator('#default-layout')).toBeVisible()
    await expect(page.getByText('Default Layout')).toBeVisible()
    await expect(page.locator('#text')).toHaveText('DefaultLayout/Index')
  })

  test('it renders arrow function components assigned directly to Page.layout', async ({ page }) => {
    await page.goto('/default-layout/with-arrow-function-layout')

    await expect(page.locator('#page-layout')).toBeVisible()
    await expect(page.getByText('Page Layout')).toBeVisible()
    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithArrowFunctionLayout')
  })

  test('it supports render functions with sibling elements at depth 1', async ({ page }) => {
    await page.goto('/default-layout/with-sibling-render-function')

    await expect(page.locator('#render-layout')).toBeVisible()
    await expect(page.locator('#layout-sibling')).toBeVisible()
    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithSiblingRenderFunction')
  })

  test('it supports render functions with sibling elements nested at depth 2', async ({ page }) => {
    await page.goto('/default-layout/with-nested-sibling-render-function')

    await expect(page.locator('#outer-layout')).toBeVisible()
    await expect(page.locator('#inner-layout')).toBeVisible()
    await expect(page.locator('#layout-sibling')).toBeVisible()
    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithNestedSiblingRenderFunction')
  })

  test('it supports render functions that return the page directly', async ({ page }) => {
    await page.goto('/default-layout/with-passthrough-render-function')

    await expect(page.locator('#text')).toHaveText('DefaultLayout/WithPassthroughRenderFunction')
  })
})
