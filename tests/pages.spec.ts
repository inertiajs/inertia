import { expect, Page, test } from '@playwright/test'

test('receives data from the controllers as props', async ({ page }) => {
  await page.goto('/')
  const inertiaProps = await page.evaluate(() => (window as any)._inertia_props)

  await expect(inertiaProps.example).toEqual('FooBar')
})

test('it preserves equal props from the previous page', async ({ page }) => {
  await page.goto('/preserve-equal-props')

  await expect(page.locator('#count-a')).toHaveText('Count A: 1')
  await expect(page.locator('#effect-a')).toHaveText('Effect A Count: 1')
  await expect(page.locator('#effect-b')).toHaveText('Effect B Count: 1')

  await page.getByRole('button', { name: 'Submit and redirect back' }).click()

  await expect(page.locator('#effect-b')).toHaveText('Effect B Count: 2') // updated
  await expect(page.locator('#effect-a')).toHaveText('Effect A Count: 1') // preserved
})

test.describe('preserve equal props on reload', () => {
  const counts = (page: Page) =>
    Promise.all(
      ['#effect-count', '#store-effect-count'].map(async (selector) =>
        Number((await page.locator(selector).textContent())?.replace(/\D/g, '')),
      ),
    )

  test.beforeEach(async ({ page }) => {
    await page.goto('/preserve-equal-props/reload')
    await expect(page.locator('#tick')).toHaveText('Tick: 0')
  })

  test('it runs each effect on a prop once on mount', async ({ page }) => {
    await expect(page.locator('#effect-count')).toHaveText('Effect count: 1')
    await expect(page.locator('#store-effect-count')).toHaveText('Store effect count: 1')
  })

  test('it does not re-run effects on a preserved prop after partial reloads (usePoll with only)', async ({ page }) => {
    const before = await counts(page)

    for (let tick = 1; tick <= 3; tick++) {
      await page.getByRole('button', { name: 'Reload tick only' }).click()
      await expect(page.locator('#tick')).toHaveText(`Tick: ${tick}`)
    }

    expect(await counts(page)).toEqual(before)
  })

  test('it does not re-run effects on a preserved prop after full reloads with equal props', async ({ page }) => {
    const before = await counts(page)

    for (let tick = 1; tick <= 3; tick++) {
      await page.getByRole('button', { name: 'Reload all props' }).click()
      await expect(page.locator('#tick')).toHaveText(`Tick: ${tick}`)
    }

    expect(await counts(page)).toEqual(before)
  })

  test('it does not re-run effects on a preserved prop when flash data arrives', async ({ page }) => {
    const before = await counts(page)

    await page.getByRole('button', { name: 'Set flash' }).click()
    await expect(page.locator('#flash')).toHaveText('Flash: {"message":"Saved"}')

    expect(await counts(page)).toEqual(before)
  })

  test('it re-runs effects when the prop changes', async ({ page }) => {
    const before = await counts(page)

    await page.getByRole('button', { name: 'Change file' }).click()
    await expect(page.locator('#file')).toHaveText('File: /files/other.pdf')

    expect(await counts(page)).toEqual(before.map((count) => count + 1))
  })

  test('a reload replaces a prop edited through the page store with the server value', async ({ page }) => {
    test.skip(process.env.PACKAGE === 'react', 'React page props are not reactive to local edits')

    await page.getByRole('button', { name: 'Edit file locally' }).click()
    await expect(page.locator('#file')).toHaveText('File: /files/edited.pdf')

    await page.getByRole('button', { name: 'Reload all props' }).click()
    await expect(page.locator('#tick')).toHaveText('Tick: 1')
    await expect(page.locator('#file')).toHaveText('File: /files/report.pdf')
  })
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

  test.describe('React-only', () => {
    test.skip(process.env.PACKAGE !== 'react', 'React-only test')

    test('can have a persistent layout (array of components)', async ({ page }) => {
      await page.goto('/persistent-layouts/array-arrow/simple/page-a')

      const layoutAId = await page.evaluate(() => (window as any)._inertia_layout_id)
      await expect(layoutAId).not.toBeNull()

      await expect(page.getByText('Simple Persistent Layout - Page A')).toBeVisible()
      await page.getByRole('link', { name: 'Page B' }).click()

      await expect(page).toHaveURL('/persistent-layouts/array-arrow/simple/page-b')
      await expect(page.getByText('Simple Persistent Layout - Page B')).toBeVisible()

      const layoutBId = await page.evaluate(() => (window as any)._inertia_layout_id)
      await expect(layoutBId).toEqual(layoutAId)
    })

    test('can have a persistent layout (function declaration component)', async ({ page }) => {
      await page.goto('/persistent-layouts/function-declaration/simple/page-a')

      const layoutAId = await page.evaluate(() => (window as any)._inertia_layout_id)
      await expect(layoutAId).not.toBeNull()

      await expect(page.getByText('Simple Persistent Layout - Page A')).toBeVisible()
      await page.getByRole('link', { name: 'Page B' }).click()

      await expect(page).toHaveURL('/persistent-layouts/function-declaration/simple/page-b')
      await expect(page.getByText('Simple Persistent Layout - Page B')).toBeVisible()

      const layoutBId = await page.evaluate(() => (window as any)._inertia_layout_id)
      await expect(layoutBId).toEqual(layoutAId)
    })
  })
})
