import { expect, test } from '@playwright/test'

test.describe('configureInertiaApp', () => {
  test('it renders a page with props', async ({ page }) => {
    await page.goto('/unified/props')

    await expect(page.locator('#foo')).toContainText('Foo: bar')
    await expect(page.locator('#count')).toContainText('Count: 42')
    await expect(page.locator('#items')).toContainText('Items: a, b, c')
  })

  test('it navigates between pages', async ({ page }) => {
    await page.goto('/unified/props')

    await expect(page.locator('#foo')).toContainText('Foo: bar')

    await page.click('text=Navigate')
    await page.waitForURL('/unified/navigate')

    // After navigation, Home component should be rendered
    await expect(page.locator('.text')).toContainText('This is the Test App Entrypoint page')
  })

  test('it loads the home page via unified entry', async ({ page }) => {
    await page.goto('/unified')

    // Home component should render
    await expect(page.locator('.text')).toContainText('This is the Test App Entrypoint page')

    // The props should be available
    const props = await page.evaluate(() => (window as any)._inertia_props)
    expect(props.example).toBe('FooBar')
  })
})
