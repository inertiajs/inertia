import { expect, test } from '@playwright/test'

test('receives data from the controllers as props', async ({ page }) => {
  await page.goto('/')
  const inertiaProps = await page.evaluate(() => (window as any)._inertia_props)

  await expect(inertiaProps.example).toEqual('FooBar')
})

test.describe('persistent layouts', () => {
  const layoutData = [{ method: 'render-function' }, { method: 'shorthand' }] as const

  layoutData.forEach(({ method }) => {
    test(`can have a persistent layout (${method})`, async ({ page }) => {
      await page.goto(`/persistent-layouts/${method}/simple/page-a`)

      const layoutAId = await page.evaluate(() => (window as any)._inertia_layout_id)
      await expect(layoutAId).not.toBeNull()

      await expect(page.getByText('Simple Persistent Layout - Page A')).toBeVisible()
      await page.getByRole('link', { name: 'Page B' }).click()

      await expect(page).toHaveURL(`/persistent-layouts/${method}/simple/page-b`)
      await expect(page.getByText('Simple Persistent Layout - Page B')).toBeVisible()

      const layoutBId = await page.evaluate(() => (window as any)._inertia_layout_id)
      await expect(layoutBId).toEqual(layoutAId)
    })
  })

  layoutData.forEach(({ method }) => {
    test(`can create more complex layout arrangements using nested layouts (${method})`, async ({ page }) => {
      await page.goto(`/persistent-layouts/${method}/nested/page-a`)

      const layoutAId = await page.evaluate(() => (window as any)._inertia_layout_id)
      const nestedLayoutAId = await page.evaluate(() => (window as any)._inertia_nested_layout_id)
      await expect(layoutAId).not.toBeNull()
      await expect(nestedLayoutAId).not.toBeNull()

      await expect(page.getByText('Nested Persistent Layout - Page A')).toBeVisible()
      await page.getByRole('link', { name: 'Page B' }).click()

      await expect(page).toHaveURL(`/persistent-layouts/${method}/nested/page-b`)
      await expect(page.getByText('Nested Persistent Layout - Page B')).toBeVisible()

      const layoutBId = await page.evaluate(() => (window as any)._inertia_layout_id)
      const nestedLayoutBId = await page.evaluate(() => (window as any)._inertia_nested_layout_id)
      await expect(layoutBId).toEqual(layoutAId)
      await expect(nestedLayoutBId).toEqual(nestedLayoutAId)
    })
  })

  test('has the page props available within the persistent layout', async ({ page }) => {
    await page.goto('/persistent-layouts/shorthand/simple/page-a')

    const pageProps = await page.evaluate(() => (window as any)._inertia_page_props)
    const layoutProps = await page.evaluate(() => (window as any)._inertia_site_layout_props)

    await expect(pageProps.foo).toBeDefined()
    await expect(pageProps.baz).toBeDefined()
    await expect(layoutProps.foo).toBeDefined()
    await expect(layoutProps.baz).toBeDefined()
  })

  test('has the page props available within all nested persistent layouts', async ({ page }) => {
    await page.goto('/persistent-layouts/shorthand/nested/page-a')

    const pageProps = await page.evaluate(() => (window as any)._inertia_page_props)
    const layoutProps = await page.evaluate(() => (window as any)._inertia_site_layout_props)
    const nestedLayoutProps = await page.evaluate(() => (window as any)._inertia_nested_layout_props)

    await expect(pageProps.foo).toBeDefined()
    await expect(pageProps.baz).toBeDefined()
    await expect(layoutProps.foo).toBeDefined()
    await expect(layoutProps.baz).toBeDefined()
    await expect(nestedLayoutProps.foo).toBeDefined()
    await expect(nestedLayoutProps.baz).toBeDefined()
  })
})
