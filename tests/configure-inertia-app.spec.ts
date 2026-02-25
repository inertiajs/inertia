import { expect, Page, test } from '@playwright/test'

declare const process: { env: { PACKAGE?: string } }

function hasStrictMode(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.getElementById('app')!
    const fiberKey = Object.keys(el).find((key) => key.startsWith('__reactContainer'))!
    const rootFiber = (el as any)[fiberKey]?.stateNode?.current

    let fiber = rootFiber?.child

    while (fiber) {
      if (fiber.type?.toString?.() === 'Symbol(react.strict_mode)') {
        return true
      }

      fiber = fiber.child
    }

    return false
  })
}

test.describe('createInertiaApp', () => {
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

  test('it wraps the app in StrictMode when enabled', async ({ page }) => {
    test.skip(process.env.PACKAGE !== 'react', 'React-only tests')

    await page.goto('/unified/strict-mode?strictMode')

    await expect(page.locator('#strict-mode-status')).toContainText('Rendered')
    expect(await hasStrictMode(page)).toBe(true)
  })

  test('it does not wrap the app in StrictMode by default', async ({ page }) => {
    test.skip(process.env.PACKAGE !== 'react', 'React-only tests')

    await page.goto('/unified/strict-mode')

    await expect(page.locator('#strict-mode-status')).toContainText('Rendered')
    expect(await hasStrictMode(page)).toBe(false)
  })
})
