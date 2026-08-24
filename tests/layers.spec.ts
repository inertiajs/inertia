import { expect, test } from '@playwright/test'
import { clickAndWaitForResponse, requests, scrollElementTo } from './support'

declare const process: { env: { PACKAGE?: string } }

test('a layer response renders over the page already displayed', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('0')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')

  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('1')
})

test("usePage() inside a layer reads the layer's own page, not the page beneath it", async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')

  await expect(page.locator('[data-layer-index="0"] [data-testid="layer-use-page"]')).toHaveText(
    'first|/layers/panel/first|Layers/Panel',
  )
})

test('usePage() at module scope falls back to the global page without throwing', async ({ page }) => {
  // Svelte 5's getContext throws outside component init, so the accessor guards the read. The
  // module block runs before the app mounts, so the store it falls back to is still empty.
  test.skip(process.env.PACKAGE !== 'svelte', 'Svelte-only: module-scope usePage guard')

  await page.goto('/layers/module-scope')

  await expect(page.getByText('Module scope page')).toBeVisible()
  await expect(page.locator('[data-testid="module-scope-page"]')).toHaveText('Layers/ModuleScope|/layers/module-scope')
  await expect(page.evaluate(() => window.moduleScopePageUrl)).resolves.toBe('')
})

test('usePage() at module scope on vue3 falls back without a console warning', async ({ page }) => {
  // Vue's inject() warns outside a setup() context, so the accessor guards the read with
  // hasInjectionContext(). The module block runs before the app mounts, so the ref is still empty.
  test.skip(process.env.PACKAGE !== 'vue3', 'Vue-only: module-scope usePage inject guard')

  const warnings: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') warnings.push(msg.text())
  })

  await page.goto('/layers/module-scope')

  await expect(page.getByText('Module scope page')).toBeVisible()
  await expect(page.locator('[data-testid="module-scope-page"]')).toHaveText('Layers/ModuleScope|/layers/module-scope')
  await expect(page.evaluate(() => window.moduleScopePageUrl)).resolves.toBeUndefined()
  expect(warnings.filter((w) => w.includes('inject() can only be used inside setup'))).toEqual([])
})

test('the page beneath a layer keeps its state', async ({ page }) => {
  await page.goto('/layers/base')
  await page.locator('#note').fill('typed before the layer opened')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await expect(page.locator('#note')).toHaveValue('typed before the layer opened')
})

test('layers stack, and two of the same component stay separate instances', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"] .panel-note').fill('typed in the first panel')

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Panel layer: second')).toBeVisible()

  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-top', 'false')
  await expect(page.locator('[data-layer-index="1"]')).toHaveAttribute('data-layer-top', 'true')

  await expect(page.locator('[data-layer-index="0"] .panel-note')).toHaveValue('typed in the first panel')
  await expect(page.locator('[data-layer-index="1"] .panel-note')).toHaveValue('')
})

test('a layer opening does not replay the flash and errors of the page beneath', async ({ page }) => {
  await page.goto('/layers/base?stale')
  await expect(page.locator('#page-error')).toHaveText('The name field is required.')

  await clickAndWaitForResponse(page, 'Open panel with callbacks', '/layers/panel/first', 'button')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await expect(page.locator('#visit-events')).toHaveText('success')
  await expect(page.locator('#page-error')).toHaveText('The name field is required.')
})

test('a form submitted inside a layer lands its errors on the layer, not the page beneath', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Submit panel form', exact: true }).click()

  await expect(page.locator('.panel-form-error')).toHaveText('The note field is required.')
  await expect(page.locator('#page-error')).toHaveCount(0)
  await expect(page.getByText('Panel layer: first')).toBeVisible()
})

test("a form's optimistic update inside a layer applies to the layer's own props", async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  // The route counts its answers per browser context, so this is the first one this test has had.
  await expect(page.locator('[data-testid="panel-count"]')).toHaveText('1')

  // 99 is a value the route never answers with, so it can only have come from the callback.
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Submit panel form optimistically' }).click()

  await expect(page.locator('[data-testid="panel-count"]')).toHaveText('99')
})

test('an optimistic update leaves an open stack standing', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  // The base is inert under the layer's dialog, so the post is issued through the router.
  await page.evaluate(() =>
    window.testing.Inertia.optimistic((props: { likes: number }) => ({ likes: props.likes + 1 })).post('/layers/like'),
  )

  await expect(page.locator('#likes')).toHaveText('1')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
})

test('a client visit that installs another page leaves an open stack behind', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('#layer-count')).toHaveText('1')

  // The base is inert under the layer's dialog, so the visit is issued through the router.
  await page.evaluate(() =>
    window.testing.Inertia.push({
      url: '/layers/panel/client',
      component: 'Layers/Panel',
      props: { name: 'from a client visit' },
    }),
  )

  await expect(page.getByText('Panel layer: from a client visit')).toBeVisible()
  await expect(page.getByText('Base page')).toBeHidden()
  await expect(page.getByText('Panel layer: first')).toBeHidden()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('opening a layer leaves the page beneath scrolled where the user left it', async ({ page }) => {
  await page.goto('/layers/base')

  // The spacer sits above the content, so scrolling to the bottom leaves the link where it is.
  await scrollElementTo(
    page,
    page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)),
  )
  const scrolled = await page.evaluate(() => window.scrollY)
  expect(scrolled).toBeGreaterThan(0)

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  expect(await page.evaluate(() => window.scrollY)).toBe(scrolled)
})

test('a layer open superseded before it resolves never appears on screen', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open slow panel', '/layers/slow')
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: 'Push panel as a page' }).click()

  await expect(page.getByText('Panel layer: from a client visit')).toBeVisible()
  await expect(page.getByText('Base page')).toBeHidden()

  // Outlive the resolver delay the superseded layer is still waiting on.
  await page.waitForTimeout(700)

  await expect(page.getByText('Slow layer')).toBeHidden()
  await expect(page.getByText('Base page')).toBeHidden()
})

test('a layer the visit was aimed at opens over the page it was made from', async ({ page }) => {
  await page.context().addCookies([{ name: 'layers-auth', value: '1', domain: 'localhost', path: '/' }])

  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open settings', '/layers/settings')

  await expect(page.getByText('Account settings')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('1')
})

test('a layer returned through a login page opens cold, so the login page is never its backdrop', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await clickAndWaitForResponse(page, 'Open settings', '/layers/login')
  await expect(page.locator('#login-page')).toBeVisible()
  await expect(page.getByText('Base page')).toBeHidden()

  await clickAndWaitForResponse(page, 'Sign in', '/layers/settings', 'button')

  await expect(page.getByText('Account settings')).toBeVisible()
  // The failure to watch for is the login page still standing underneath.
  await expect(page.locator('#login-page')).toBeHidden()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
})

test('a cold layer stands on nothing at all until the walk lands the base beneath it', async ({ page }) => {
  await page.goto('/layers/base?withDefaultLayout')
  await expect(page.locator('#default-layout')).toHaveCount(1)

  await clickAndWaitForResponse(page, 'Open settings', '/layers/login')
  await expect(page.locator('#login-page')).toBeVisible()

  // The hop is held so the cold window can be looked at rather than raced.
  let landTheBase!: () => void
  const held = new Promise<void>((resolve) => (landTheBase = resolve))
  await page.route('**/layers/base', async (route) => {
    await held
    await route.continue()
  })

  const walkHop = page.waitForRequest('**/layers/base')
  await clickAndWaitForResponse(page, 'Sign in', '/layers/settings', 'button')
  await expect(page.getByText('Account settings')).toBeVisible()
  await walkHop

  await expect(page.locator('#login-page')).toBeHidden()
  await expect(page.getByText('Base page')).toBeHidden()
  await expect(page.locator('[data-layer-index="0"] #default-layout')).toBeVisible()
  await expect(page.locator('#default-layout')).toHaveCount(1)

  landTheBase()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#default-layout')).toHaveCount(2)
  await expect(page.getByText('Account settings')).toBeVisible()
})

test('a defaultLayout that decides by page.url never matches a layer with no url of its own', async ({ page }) => {
  await page.goto('/layers/base?withUrlBasedLayout')
  await expect(page.locator('#admin-layout')).toBeVisible()

  await page.getByRole('button', { name: 'Open local layer' }).click()

  await expect(page.locator('[data-layer-index="0"] #default-layout')).toBeVisible()
  await expect(page.locator('[data-layer-index="0"] #admin-layout')).toHaveCount(0)
})

test("a layer's layout reads the layer's own props and its own layout props", async ({ page }) => {
  await page.goto('/layers/base?withDefaultLayout')
  await expect(page.locator('#default-layout')).toHaveCount(1)

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  const layerId = await page.evaluate(() => (window.history.state.page.layers as { id: string }[])[0].id)
  await page.evaluate((id) => window.testing.setLayoutProps({ layerChrome: 'layer' }, id), layerId)

  await expect(page.locator('[data-layer-index="0"] #layout-name')).toHaveText('first')
  await expect(page.locator('[data-layer-index="0"] #layer-chrome')).toHaveText('layer')
  await expect(page.locator('#layout-name').first()).toHaveText('')
  await expect(page.locator('#layer-chrome').first()).toHaveText('')
})

test('reopening the same layer keeps its layout props, which hold through the exit', async ({ page }) => {
  await page.context().addCookies([{ name: 'layers-auth', value: '1', domain: 'localhost', path: '/' }])
  await page.goto('/layers/base?withDefaultLayout')

  await clickAndWaitForResponse(page, 'Open settings', '/layers/settings')
  await expect(page.locator('[data-layer-index="0"] #layer-chrome')).toHaveText('layer')

  await clickAndWaitForResponse(page, 'Open settings again', '/layers/settings')
  await expect(page.locator('[data-layer-index="0"] #layer-chrome')).toHaveText('layer')

  // An exit transition makes the closing window observable.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 400ms }' })
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-closing', 'true')
  await expect(page.locator('[data-layer-index="0"] #layer-chrome')).toHaveText('layer')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('closing a layer drops its layout props, so a forward restore finds nothing stale', async ({ page }) => {
  await page.goto('/layers/base?withDefaultLayout')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  const layerId = await page.evaluate(() => (window.history.state.page.layers as { id: string }[])[0].id)
  await page.evaluate((id) => window.testing.setLayoutProps({ layerChrome: 'layer' }, id), layerId)
  await expect(page.locator('[data-layer-index="0"] #layer-chrome')).toHaveText('layer')

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  await page.goForward()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.locator('[data-layer-index="0"] #layer-chrome')).toHaveText('')
})

test('a client visit that rewrites the page beneath a layer still clears what it was showing', async ({ page }) => {
  await page.context().addCookies([{ name: 'layers-auth', value: '1', domain: 'localhost', path: '/' }])
  await page.goto('/layers/base?withDefaultLayout')
  await expect(page.locator('#default-layout')).toHaveCount(1)

  // Set by hand rather than on mount: a remount would re-apply it and hide the reset.
  await page.getByRole('button', { name: 'Set base chrome' }).click()
  await expect(page.locator('#base-chrome')).toHaveText('base')

  await clickAndWaitForResponse(page, 'Open settings', '/layers/settings')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.evaluate(() =>
    window.testing.Inertia.replace({ url: '/layers/base?withDefaultLayout', props: { likes: 0 } }),
  )

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.locator('#base-chrome').first()).toHaveText('')
})

test('a layer opened cold keeps its title when the page beneath it arrives', async ({ page }) => {
  test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')

  // The hop is held so the title can be looked at before and after its ancestry arrives. Firefox
  // does not fire load while a route is holding a request, so the navigation waits for commit.
  let landTheBase!: () => void
  const held = new Promise<void>((resolve) => (landTheBase = resolve))
  await page.route('**/layers/headed-base', async (route) => {
    await held
    await route.continue()
  })

  await page.goto('/layers/headed', { waitUntil: 'commit' })
  await expect(page).toHaveTitle('Headed Layer')

  landTheBase()
  await expect(page.getByText('Headed base page')).toBeVisible()
  await expect(page).toHaveTitle('Headed Layer')
})

test("a stack opened cold keeps the top layer's title as the layers beneath it arrive", async ({ page }) => {
  test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')

  await page.goto('/layers/chain/outer')

  await expect(page).toHaveTitle('Chain outer')
  await expect(page.getByText('Chain inner')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
})

test('a title callback that reads page props is applied to the layer title, not the page', async ({ page }) => {
  test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')

  // The hop is held so the title can be looked at during the cold window.
  let landTheBase!: () => void
  const held = new Promise<void>((resolve) => (landTheBase = resolve))
  await page.route('**/layers/headed-base', async (route) => {
    await held
    await route.continue()
  })

  await page.goto('/layers/headed?withLayersTitleCallback', { waitUntil: 'commit' })
  await expect(page).toHaveTitle('Headed Layer | Layered')

  landTheBase()
  await expect(page.getByText('Headed base page')).toBeVisible()
  await expect(page).toHaveTitle('Headed Layer | Layered')
})

test('renders a wrapper carrying the layer id, and none when no layer is open', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.locator('[data-layer-id]')).toHaveCount(0)

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  const layerId = await page.evaluate(() => (window.history.state.page.layers as { id: string }[])[0].id)

  await expect(page.locator('[data-layer-id]')).toHaveCount(1)
  await expect(page.locator(`[data-layer-id="${layerId}"]`)).toHaveCount(1)
  await expect(page.locator(`[data-layer-id="${layerId}"]`)).toContainText('Panel layer: first')
})

test('a cold layer scroll region restores its own position, never the base', async ({ page }) => {
  // The base hop is held so the layer's region can be scrolled while it is the only one on screen.
  let landTheBase!: () => void
  const held = new Promise<void>((resolve) => (landTheBase = resolve))
  await page.route('**/layers/scroll-base', async (route) => {
    await held
    await route.continue()
  })

  await page.goto('/layers/scroll', { waitUntil: 'commit' })
  await expect(page.locator('#layer-region')).toBeVisible()

  await page.evaluate(() => document.querySelector('#layer-region')?.scrollTo(0, 200))
  await page.waitForTimeout(250)

  landTheBase()
  await expect(page.getByText('Scroll base page')).toBeVisible()

  await expect
    .poll(() => page.evaluate(() => (document.querySelector('#layer-region') as HTMLElement | null)?.scrollTop))
    .toBe(200)
  await expect
    .poll(() => page.evaluate(() => (document.querySelector('#base-region') as HTMLElement | null)?.scrollTop))
    .toBe(0)
})

test("a restore after a layer closes still restores the page's scroll regions", async ({ page }) => {
  await page.goto('/layers/scroll-base')
  await expect(page.locator('#base-region')).toBeVisible()
  await page.evaluate(() => document.querySelector('#base-region')?.scrollTo(0, 100))
  await page.waitForTimeout(250)

  await page.evaluate(() => window.testing.Inertia.layer({ component: 'Layers/ScrollLayer' }))
  await expect(page.locator('#layer-region')).toBeVisible()
  await page.evaluate(() => document.querySelector('#layer-region')?.scrollTo(0, 200))
  await page.waitForTimeout(250)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  // The close's own scroll restore settles first, or it would rewind the next scroll.
  await page.waitForTimeout(300)

  await page.evaluate(() => document.querySelector('#base-region')?.scrollTo(0, 150))
  await page.waitForTimeout(250)

  const scrollState = await page.evaluate(() => ({
    scrollRegions: window.history.state?.scrollRegions,
    scrollRegionLayers: window.history.state?.scrollRegionLayers,
  }))
  expect(scrollState.scrollRegionLayers).toBeUndefined()

  // Wait for the marker before polling the scroll, so the poll never races the navigation's
  // context teardown.
  await page.goto('/layers/base')
  await page.goBack()
  await expect(page).toHaveURL('/layers/scroll-base')
  await expect(page.locator('#base-region')).toBeVisible()

  await expect
    .poll(() => page.evaluate(() => (document.querySelector('#base-region') as HTMLElement | null)?.scrollTop))
    .toBe(150)
})

test('an infinite-scroll layer paginates its own scroll props, never the base', async ({ page }) => {
  await page.goto('/layers/infinite')
  await expect(page.getByText('Infinite layer')).toBeVisible()
  await expect(page.getByText('User 1', { exact: true })).toBeVisible()
  await expect(page.getByText('User 16')).toBeHidden()

  await page.getByRole('button', { name: 'Load next items' }).click()

  await expect(page.getByText('User 16')).toBeVisible()
  const baseUsersScrollProp = await page.evaluate(
    () => (window.history.state.page.scrollProps as { users?: { nextPage: number | null } })?.users,
  )
  expect(baseUsersScrollProp?.nextPage).toBeNull()
})

test('a failed submit inside a layer keeps the page it was opened from beneath it', async ({ page }) => {
  await page.goto('/layers/base')
  await page.locator('#note').fill('typed before the layer opened')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"] .panel-note').fill('typed in the panel')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Save panel' }).click()

  await expect(page.locator('.panel-error')).toHaveText('The note field is required.')
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#note')).toHaveValue('typed before the layer opened')
  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.locator('[data-layer-index="0"] .panel-note')).toHaveValue('typed in the panel')
})

test('a layer redirected to from inside the stack opens on top of that stack', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()

  await expect(page.getByText('Panel layer: second')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('2')
  await expect(page.locator('[data-layer-index="0"]')).toContainText('Panel layer: first')
  await expect(page.locator('[data-layer-index="1"]')).toContainText('Panel layer: second')
})

test('a prefetched layer replayed after an instant visit opens cold, not over the page the visit put up', async ({
  page,
}) => {
  await page.goto('/layers/waypoint/a')
  await clickAndWaitForResponse(page, 'Prefetch the panel', '/layers/panel/first', 'button')

  await clickAndWaitForResponse(page, 'Go to the next waypoint', '/layers/waypoint/b')
  await clickAndWaitForResponse(page, 'Go to the next waypoint', '/layers/waypoint/c')
  await expect(page.locator('#waypoint')).toHaveText('Waypoint c')

  // The instant swap fabricates a page before the prefetched response is replayed, so the base
  // the visit was dispatched from is two navigations and a swap gone.
  requests.listen(page)
  await page.getByRole('button', { exact: true, name: 'Instantly open the panel' }).click()
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  expect(requests.requests.filter((request) => request.url().includes('/layers/panel/first'))).toHaveLength(0)

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#waypoint')).toBeHidden()
})

test('a background reload landing mid-flight leaves the layer composing onto the base it refreshed', async ({
  page,
}) => {
  await page.goto('/layers/base')
  await page.locator('#note').fill('typed before the layer opened')

  const layerResponse = page.waitForResponse((response) => response.url().includes('/layers/panel/delayed'))
  await page.getByRole('link', { exact: true, name: 'Open delayed panel' }).click()

  await clickAndWaitForResponse(page, 'Refresh in the background', '/layers/base', 'button')
  await layerResponse

  await expect(page.getByText('Panel layer: delayed')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.locator('#note')).toHaveValue('typed before the layer opened')
})

test('opening a layer moves the address to the layer, leaving the page beneath one entry back', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page).toHaveURL('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await expect(page).toHaveURL('/layers/panel/first')

  await page.goBack()

  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Panel layer: first')).toBeHidden()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page).toHaveURL('/layers/panel/first')
})

test('forward restores the layer and its address over the page it was opened from', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page).toHaveURL('/layers/panel/first')

  await page.goBack()
  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  await page.goForward()

  await expect(page).toHaveURL('/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
})

test('the address of a stack two layers deep is the topmost layer', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page).toHaveURL('/layers/panel/first')

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()
  await expect(page.getByText('Panel layer: second')).toBeVisible()
  await expect(page).toHaveURL('/layers/panel/second')

  await page.goBack()
  await expect(page).toHaveURL('/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: second')).toBeHidden()

  await page.goBack()
  await expect(page).toHaveURL('/layers/base')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('the entry a layer pushes carries the state of the page beneath it', async ({ page }) => {
  await page.goto('/layers/base')
  await page.locator('#remembered-note').fill('typed before the layer opened')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.goBack()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.locator('#remembered-note')).toHaveValue('typed before the layer opened')

  requests.listen(page)
  await page.goForward()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await expect(page.locator('#remembered-note')).toHaveValue('typed before the layer opened')
  expect(requests.requests.filter((request) => request.url().includes('/layers/'))).toHaveLength(0)
})

test('a layer that opens without moving the address leaves it on the layer beneath', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page).toHaveURL('/layers/panel/first')

  await clickAndWaitForResponse(
    page,
    'Open a second panel without moving the address',
    '/layers/panel/second',
    'button',
  )
  await expect(page.getByText('Panel layer: second')).toBeVisible()
  await expect(page).toHaveURL('/layers/panel/first')

  // A keystroke on the base is what writes history next. The base is inert under the layer dialogs, and
  // a Playwright fill on an inert element only sets the value, so the input event is dispatched
  // by hand.
  await page.evaluate(() => {
    const input = document.querySelector('#remembered-note') as HTMLInputElement
    input.value = 'typed with two layers open'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })

  await expect(page).toHaveURL('/layers/panel/first')
  await expect(page.locator('#layer-count')).toHaveText('2')
})

test('a layer being closed stays on screen until the shell says it is done', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page).toHaveURL('/layers/panel/first')
  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-closing', 'false')

  // An exit transition makes the closing window observable. Nothing is clicked: the shell reports
  // done itself once the exit finishes.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 400ms }' })
  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-closing', 'true')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page).toHaveURL('/layers/panel/first')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()
})

test('closing a layer marks the layers above it, and waits for all of them', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()

  // The lower layer is inert under the top one's dialog, so the close is issued through the router.
  // An exit transition makes the closing window observable.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 400ms }' })
  const lowerLayerId = await page.evaluate(() => (window.history.state.page.layers as { id: string }[])[0].id)
  // Not returned: the close resolves once the layers are gone, and the exit is what this asserts.
  await page.evaluate((id) => void window.testing.Inertia.close(id), lowerLayerId)

  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-closing', 'true')
  await expect(page.locator('[data-layer-index="1"]')).toHaveAttribute('data-layer-closing', 'true')
  await expect(page.locator('[data-layer-index]')).toHaveCount(2)

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')
})

test('closing a layer in the middle of the stack leaves the one beneath it holding its own state', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"] .panel-note').fill('typed in the first panel')

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()
  await page.locator('[data-layer-index="1"] .panel-note').fill('typed in the second panel')

  // The panel's next button always lands on the second, and the base link is inert under the
  // layer dialogs, so the third is opened through the router.
  const thirdPanelResponse = page.waitForResponse((response) => response.url().includes('/layers/panel/third'))
  await page.evaluate(() => window.testing.Inertia.visit('/layers/panel/third'))
  await thirdPanelResponse
  await page.locator('[data-layer-index="2"] .panel-note').fill('typed in the third panel')

  // The middle layer is inert under the top one's dialog, so the close is issued through the router.
  const middleLayerId = await page.evaluate(() => (window.history.state.page.layers as { id: string }[])[1].id)
  await page.evaluate((id) => window.testing.Inertia.close(id), middleLayerId)

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: second')).toBeHidden()
  await expect(page.getByText('Panel layer: third')).toBeHidden()

  await expect(page.locator('[data-layer-index="0"]')).toContainText('Panel layer: first')
  await expect(page.locator('[data-layer-index="0"] .panel-note')).toHaveValue('typed in the first panel')
  await expect(page).toHaveURL('/layers/panel/first')
})

test('the browser back dismisses the top layer, running its exit like any other close', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-closing', 'false')

  // An exit transition makes the closing window observable. The shell reports done once it finishes.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 400ms }' })
  await page.goBack()

  await expect(page.locator('[data-layer-index="0"]')).toHaveAttribute('data-layer-closing', 'true')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()
})

test('a history jump past the entry beneath drops the stack rather than dismissing it', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.locator('#layer-count')).toHaveText('2')

  // A long exit makes a dismissal impossible to miss: the stack would still be on screen when the
  // assertion below runs, rather than gone with the swap.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 2000ms }' })
  await page.evaluate(() => window.history.go(-2))

  await expect(page.locator('[data-layer-index]')).toHaveCount(0, { timeout: 1000 })
  await expect(page).toHaveURL('/layers/base')
})

test('closing a layer unwinds the history it pushed, so forward opens it again', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')

  await page.goForward()

  await expect(page).toHaveURL('/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
})

test('closing a layer that never moved the address leaves the history beneath it alone', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await clickAndWaitForResponse(
    page,
    'Open a second panel without moving the address',
    '/layers/panel/second',
    'button',
  )
  await expect(page.locator('#layer-count')).toHaveText('2')
  await expect(page).toHaveURL('/layers/panel/first')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.locator('[data-layer-index="0"]')).toContainText('Panel layer: first')
  await expect(page).toHaveURL('/layers/panel/first')

  await page.goBack()
  await expect(page).toHaveURL('/layers/base')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('a layer whose key is already open is rewritten where it stands rather than replaced', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open step one', '/layers/step/one')
  await expect(page.getByText('Panel layer: one')).toBeVisible()
  await page.locator('[data-layer-index="0"] .panel-note').fill('typed in step one')

  const element = await page.locator('[data-layer-index="0"]').elementHandle()

  const stepTwoResponse = page.waitForResponse((response) => response.url().includes('/layers/step/two'))
  await page.evaluate(() => window.testing.Inertia.visit('/layers/step/two'))
  await stepTwoResponse

  await expect(page.getByText('Panel layer: two')).toBeVisible()
  await expect(page).toHaveURL('/layers/step/two')
  await expect(page.locator('#layer-count')).toHaveText('1')

  expect(await element!.evaluate((node) => node.isConnected)).toBe(true)
  await expect(page.locator('[data-layer-index="0"] .panel-note')).toHaveValue('')
})

test("a rewrite that preserves state keeps the layer's component instance", async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open step one', '/layers/step/one')
  await page.locator('[data-layer-index="0"] .panel-note').fill('typed in step one')

  const stepTwoResponse = page.waitForResponse((response) => response.url().includes('/layers/step/two'))
  await page.evaluate(() => window.testing.Inertia.visit('/layers/step/two', { preserveState: true }))
  await stepTwoResponse

  await expect(page.getByText('Panel layer: two')).toBeVisible()
  await expect(page.locator('[data-layer-index="0"] .panel-note')).toHaveValue('typed in step one')
})

test('a layer response for an earlier level closes the layers standing above it', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open step one', '/layers/step/one')
  await clickAndWaitForResponse(page, 'Open child layer', '/layers/child', 'button')
  await expect(page.locator('[data-layer-index]')).toHaveCount(2)
  await expect(page).toHaveURL('/layers/child')

  const stepTwoResponse = page.waitForResponse((response) => response.url().includes('/layers/step/two'))
  await page.evaluate(() => window.testing.Inertia.visit('/layers/step/two'))
  await stepTwoResponse

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: two')).toBeVisible()
  await expect(page.getByText('Child layer', { exact: true })).toBeHidden()
  await expect(page).toHaveURL('/layers/step/two')

  // The entries the closed child owned are still in front of the base, so closing what is left has
  // to step back over them as well as its own.
  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')
})

test('closing a layer that walked through several steps unwinds every entry they pushed', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open step one', '/layers/step/one')
  const stepTwoResponse = page.waitForResponse((response) => response.url().includes('/layers/step/two'))
  await page.evaluate(() => window.testing.Inertia.visit('/layers/step/two'))
  await stepTwoResponse
  await expect(page).toHaveURL('/layers/step/two')
  await expect(page.locator('#layer-count')).toHaveText('1')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')

  await page.goForward()

  await expect(page).toHaveURL('/layers/step/one')
  await expect(page.getByText('Panel layer: one')).toBeVisible()
})

test('a close abandoned by a landing response puts an already-exited layer back on screen', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()
  await expect(page.getByText('Panel layer: second')).toBeVisible()

  // The top layer's exit outruns the bottom's, so its dialog has closed by the time the response
  // lands, remakes the bottom layer, and abandons the close.
  await page.addStyleTag({
    content: `
      @keyframes layer-exit { to { opacity: 0.99 } }
      dialog[data-layer-closing="true"] { animation: layer-exit 3000ms; }
      dialog[data-layer-index="1"][data-layer-closing="true"] { animation-duration: 100ms; }
    `,
  })

  const bottomId = await page.locator('[data-layer-index="0"] [data-layer-id]').getAttribute('data-layer-id')

  await page.evaluate((id) => {
    window.testing.Inertia.visit('/layers/panel/first?delay=600', {
      only: ['count'],
      preserveState: false,
      async: true,
    })
    window.testing.Inertia.close(id!)
  }, bottomId)

  await expect(page.locator('[data-layer-index="0"] [data-testid="panel-count"]')).toHaveText('3')
  await expect(page.getByText('Panel layer: second')).toBeVisible()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('2')
})

// The cold rows below hard-load a layer's url. Everything above opened warm, over a base on screen.

test('a layer url opened cold renders the layer and the base the walk fetches beneath it', async ({ page }) => {
  await page.goto('/layers/panel/first')

  await expect(page).toHaveURL('/layers/panel/first')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page).toHaveURL('/layers/panel/first')
})

test('a two-deep cold open resolves top down and keeps the address on the top layer', async ({ page }) => {
  requests.listen(page)
  await page.goto('/layers/chain/outer')

  await expect(page).toHaveURL('/layers/chain/outer')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Chain inner')).toBeVisible()
  await expect(page.getByText('Chain outer')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(2)
  await expect(page.locator('[data-layer-index="0"]')).toContainText('Chain inner')
  await expect(page.locator('[data-layer-index="1"]')).toContainText('Chain outer')
  await expect(page.locator('[data-layer-index="1"]')).toHaveAttribute('data-layer-top', 'true')
  await expect(page).toHaveURL('/layers/chain/outer')

  const layerRequests = requests.requests.filter((request) => request.url().includes('/layers/'))
  expect(layerRequests.map((request) => new URL(request.url()).pathname)).toEqual([
    '/layers/chain/outer',
    '/layers/chain/inner',
    '/layers/base',
  ])
})

test('a cold chain closes one layer at a time, each close leaving the rest where it is', async ({ page }) => {
  await page.goto('/layers/chain/outer')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Chain inner')).toBeVisible()
  await expect(page.getByText('Chain outer')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(2)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.locator('[data-layer-index="0"]')).toContainText('Chain inner')
  await expect(page).toHaveURL('/layers/chain/inner')
  await expect(page.getByText('Chain outer')).toBeHidden()

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Chain inner')).toBeHidden()
  await expect(page).toHaveURL('/layers/base')
})

test('a three-deep cold chain stacks its dialogs in layer order, so Escape closes only the top', async ({ page }) => {
  await page.goto('/layers/chain/top')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(3)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(2)
  await expect(page).toHaveURL('/layers/chain/middle')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page).toHaveURL('/layers/chain/inner')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')
})

test('closing a cold layer pushes the base beneath it as a step of its own', async ({ page }) => {
  // The entry beneath the cold open stands for wherever the user was before the shared link.
  await page.goto('/')
  await page.goto('/layers/panel/first')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('1')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL('/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Panel layer: first')).toBeHidden()
})

test('the hash a cold layer url arrived with survives the walk and a close', async ({ page }) => {
  await page.goto('/layers/panel/first#something')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page).toHaveURL('/layers/panel/first#something')

  expect(await page.evaluate(() => window.history.state.page.layers[0].url)).toContain('#something')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')

  await page.goBack()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page).toHaveURL('/layers/panel/first#something')
})

test('a server error fetching the base leaves the layer on screen, without the error overlay', async ({ page }) => {
  await page.goto('/layers/cold-fail')

  // The overlay must never paint over the very layer whose base failed to load.
  await expect(page.getByText('Panel layer: fail')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.locator('dialog#inertia-error-dialog')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/cold-fail')
})

test('a cold layer closed while its base fails re-requests the base and replaces the blank', async ({ page }) => {
  // The entry beneath the cold open stands for wherever the user was before the shared link.
  await page.goto('/')

  // The hop is held so the layer can be closed while it is still out.
  let releaseTheHop!: () => void
  const held = new Promise<void>((resolve) => (releaseTheHop = resolve))
  let hopRequests = 0
  await page.route('**/layers/fail-once', async (route) => {
    if (hopRequests++ === 0) {
      await held
    }
    await route.continue()
  })

  await page.goto('/layers/fail-recover', { waitUntil: 'commit' })

  await expect(page.getByText('Panel layer: fail')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Base page')).toBeHidden()
  await expect(page).toHaveURL('/layers/fail-once')
  const entriesAfterClose = await page.evaluate(() => window.history.length)

  releaseTheHop()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/fail-once')
  expect(await page.evaluate(() => window.history.length)).toBe(entriesAfterClose)

  await page.goBack()
  await expect(page.getByText('Panel layer: fail')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/fail-recover')

  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Panel layer: fail')).toBeHidden()
})

test('a cold layer closed while its base is slow restores to the base, never a blank', async ({ page }) => {
  await page.goto('/')
  // The base beneath it takes 1.5s, and Firefox does not fire load until the walk that fetches it
  // has come back, which is the window this row is about.
  await page.goto('/layers/slow-base-panel', { waitUntil: 'commit' })

  await expect(page.getByText('Panel layer: slow')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Base page')).toBeHidden()
  await expect(page).toHaveURL('/layers/base?delay=1500')

  await page.goBack()
  await expect(page.getByText('Panel layer: slow')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  await page.goForward()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  await page.goBack()
  await expect(page.getByText('Panel layer: slow')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await page.goBack()
  await expect(page).toHaveURL('/')
})

test('a layer that declares no base at all opened cold renders as a page', async ({ page }) => {
  requests.listen(page)
  await page.goto('/layers/promote-cold')

  await expect(page.getByText('Panel layer: promote')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  expect(
    requests.requests.filter(
      (request) => request.url().includes('/layers/') && !request.url().includes('/layers/promote-cold'),
    ),
  ).toHaveLength(0)

  const entry = await page.evaluate(() => window.history.state.page)
  expect(entry.layer).toBeUndefined()
})

test('a cold open fetches the base with the version the layer arrived on', async ({ page }) => {
  await page.goto('/layers/version/outer')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Panel layer: version')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
})

test('keeps a layer open across a partial reload of the base beneath it', async ({ page }) => {
  await page.goto('/layers/counted/base')
  await expect(page.getByText('Base page')).toBeVisible()

  // The layer opens with the address left on the base, so a reload re-asks for the base.
  await clickAndWaitForResponse(page, 'Open panel without moving the address', '/layers/counted/panel', 'button')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page).toHaveURL('/layers/counted/base')

  const likesBefore = await page.locator('#likes').textContent()

  // The base is inert under the layer's dialog, so the reload is issued through the router.
  const partialResponse = page.waitForResponse((response) => response.url().includes('/layers/counted/base'))
  await page.evaluate(() => window.testing.Inertia.reload({ only: ['likes'] }))
  await partialResponse

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('#likes')).not.toHaveText(likesBefore ?? '')
  await expect(page).toHaveURL('/layers/counted/base')
})

test('a layer-targeted partial names the layer in the header and merges into it, keeping a dropped prop', async ({
  page,
}) => {
  await page.goto('/layers/counted/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await clickAndWaitForResponse(page, 'Open counted panel', '/layers/counted/panel')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page).toHaveURL('/layers/counted/panel')

  const countBefore = await page.locator('[data-layer-index="0"] [data-testid="panel-count"]').textContent()
  const likesBefore = await page.locator('#likes').textContent()

  const responsePromise = page.waitForResponse((response) => response.url().includes('/layers/counted/panel'))
  const requestPromise = page.waitForRequest((request) => request.url().includes('/layers/counted/panel'))
  await page.getByRole('button', { exact: true, name: 'Partial reload panel' }).click()
  const [request] = await Promise.all([requestPromise, responsePromise])
  expect(request.headers()['x-inertia-partial-component']).toBe('Layers/Panel')

  await expect(page.locator('[data-layer-index="0"] [data-testid="panel-count"]')).not.toHaveText(countBefore ?? '')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('#likes')).toHaveText(likesBefore ?? '')
  const props = await page.evaluate(
    () => (window.history.state.page.layers as { props: Record<string, unknown> }[])[0].props,
  )
  expect(props).toMatchObject({ name: 'counted', tag: 'first' })
})

test('a request made through the layer router targets the layer', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  const countBefore = await page.locator('[data-layer-index="0"] [data-testid="panel-count"]').textContent()
  const likesBefore = await page.locator('#likes').textContent()

  const requestPromise = page.waitForRequest((request) => request.url().includes('/layers/panel/first'))
  const responsePromise = page.waitForResponse((response) => response.url().includes('/layers/panel/first'))
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Partial through the layer router' }).click()
  const [request] = await Promise.all([requestPromise, responsePromise])

  expect(request.headers()['x-inertia-partial-component']).toBe('Layers/Panel')
  await expect(page.locator('[data-layer-index="0"] [data-testid="panel-count"]')).not.toHaveText(countBefore ?? '')
  await expect(page.locator('#likes')).toHaveText(likesBefore ?? '')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
})

test('a bare reload from inside a layer refreshes the base beneath the stack', async ({ page }) => {
  await page.goto('/layers/counted/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await clickAndWaitForResponse(page, 'Open counted panel', '/layers/counted/panel')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page).toHaveURL('/layers/counted/panel')

  const likesBefore = await page.locator('#likes').textContent()

  await clickAndWaitForResponse(page, 'Reload base beneath', '/layers/counted/base', 'button')

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('#likes')).not.toHaveText(likesBefore ?? '')
})

test("a layer's replaceProp changes the layer's props, not the base's", async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  const countBefore = await page.locator('[data-layer-index="0"] [data-testid="panel-count"]').textContent()

  await page.getByRole('button', { exact: true, name: 'Layer replaceProp' }).click()

  await expect(page.locator('[data-layer-index="0"] [data-testid="panel-count"]')).toHaveText(
    String(Number(countBefore ?? 0) + 1),
  )
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.locator('#likes')).toHaveText('0')
  const props = await page.evaluate(
    () => (window.history.state.page.layers as { props: Record<string, unknown> }[])[0].props,
  )
  expect(props).toMatchObject({ name: 'first' })
  const baseProps = await page.evaluate(() => window.history.state.page.props as Record<string, unknown>)
  expect(baseProps).toEqual({ likes: 0 })
})

test("a remembered input inside a layer writes to the layer's bag, not the base's", async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.locator('[data-layer-index="0"] .layer-remembered').fill('typed in the layer')

  const layerId = await page.evaluate(() => (window.history.state.page.layers as { id: string }[])[0].id)

  // Vue and Svelte store the whole form state under the remember key; React keys its data and
  // errors separately under `${key}:data`.
  await expect
    .poll(() =>
      page.evaluate((id) => {
        const restore = (
          window.testing as { Inertia: { restore: (key: string, layerId?: string) => unknown } }
        ).Inertia.restore.bind((window.testing as { Inertia: unknown }).Inertia)
        const state = restore('note', id) as { data?: { note?: string } } | undefined
        const data = restore('note:data', id) as { note?: string } | undefined

        return state?.data?.note ?? data?.note
      }, layerId),
    )
    .toBe('typed in the layer')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const restore = (window.testing as { Inertia: { restore: (key: string) => unknown } }).Inertia.restore

        return [restore('note'), restore('note:data')]
      }),
    )
    .toEqual([undefined, undefined])
})

test("a layer's deferred props load into the layer, not the base", async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await clickAndWaitForResponse(page, 'Open deferred layer', '/layers/deferred')
  await expect(page.getByText('Deferred layer: deferred')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.locator('[data-testid="deferred-fallback"]')).toBeVisible()

  await expect(page.locator('[data-testid="deferred-stats"]')).toHaveText('1,2,3')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Deferred layer: deferred')).toBeVisible()
})

test('a layer opened through a handle opens another, whose events reach the owner handle', async ({ page }) => {
  await page.goto('/layers/base')

  await page.getByRole('button', { exact: true, name: 'Open handled panel' }).click()
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('2')

  await page.locator('[data-layer-index="1"]').getByRole('button', { name: 'Emit saved' }).click()

  await expect(page.locator('#child-events')).toHaveText('saved 5')
})

test('a layer emits to its owner and hears its children through its own useLayer()', async ({ page }) => {
  await page.goto('/layers/base')

  await page.getByRole('button', { exact: true, name: 'Open handled panel' }).click()
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()

  await page.locator('[data-layer-index="1"]').getByRole('button', { name: 'Emit saved' }).click()

  await expect(page.locator('#panel-child-events')).toHaveText('saved 5')
  await expect(page.locator('#child-events')).toHaveText('saved 5')
})

test('going back to close a child leaves the layer beneath it hearing what it opens next', async ({ page }) => {
  await page.goto('/layers/base')

  await page.getByRole('button', { exact: true, name: 'Open handled panel' }).click()
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()

  await page.goBack()

  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()
  await page.locator('[data-layer-index="1"]').getByRole('button', { name: 'Emit saved' }).click()

  await expect(page.locator('#panel-child-events')).toHaveText('saved 5')
})

test('a layer closes itself through its own useLayer()', async ({ page }) => {
  await page.goto('/layers/base')

  await page.getByRole('button', { exact: true, name: 'Open handled panel' }).click()
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.locator('#layer-count')).toHaveText('2')

  await page.locator('[data-layer-index="1"]').getByRole('button', { name: 'Close myself' }).click()

  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
})

test("a layer opened through its owner's useLayer() closes itself, leaving its owner standing", async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child through the layer' }).click()
  await expect(page.locator('#layer-count')).toHaveText('2')

  await page.locator('[data-layer-index="1"]').getByRole('button', { name: 'Close myself' }).click()

  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Child layer', { exact: true })).toBeHidden()
  await expect(page).toHaveURL('/layers/panel/first')
})

test('the handle layer.layer() returned closes the child, not the layer that opened it', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child through the layer' }).click()
  await expect(page.locator('#layer-count')).toHaveText('2')

  await page.evaluate(() => void window.testing.layerChildHandle!.close())

  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.locator('[data-layer-index="0"]')).toContainText('Panel layer: first')
  await expect(page).toHaveURL('/layers/panel/first')
})

test('the owner handle closes the child layer it opened', async ({ page }) => {
  await page.goto('/layers/base')

  await page.getByRole('button', { exact: true, name: 'Open handled panel' }).click()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()

  // An exit transition makes the closing window observable.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 400ms }' })
  await page.evaluate(() => void (window as any).testing.childHandle.close())
  await expect(page.locator('[data-layer-index="1"]')).toHaveAttribute('data-layer-closing', 'true')
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Child layer', { exact: true })).toBeHidden()
  await expect(page.locator('[data-layer-index="0"]')).toContainText('Panel layer: first')
  await expect(page).toHaveURL('/layers/panel/first')
})

test('the page beneath keeps its own state when a layer closes', async ({ page }) => {
  await page.goto('/layers/base')
  await page.locator('#note').fill('typed on the page')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('#note')).toHaveValue('typed on the page')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.locator('#layer-count')).toHaveText('0')
  await expect(page.locator('#note')).toHaveValue('typed on the page')
})

test('the page beneath is left alone when a layer closes out of the middle of a stack', async ({ page }) => {
  await page.goto('/layers/base')
  await page.locator('#note').fill('typed on the page')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"] .panel-note').fill('typed in the panel')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.locator('#layer-count')).toHaveText('2')

  await page.keyboard.press('Escape')

  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.locator('#note')).toHaveValue('typed on the page')
  await expect(page.locator('[data-layer-index="0"] .panel-note')).toHaveValue('typed in the panel')
})

test('a plain back onto the same component still remounts it, as it always did', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => window.testing.Inertia.visit('/layers/counted/base'))
  await expect(page).toHaveURL('/layers/counted/base')
  await page.locator('#note').fill('typed on the second page')

  await page.goBack()

  await expect(page).toHaveURL('/layers/base')
  await expect(page.locator('#note')).toHaveValue('')
})

test('a local layer is a history step: back closes it, forward brings it back', async ({ page }) => {
  await page.goto('/')
  await page.goto('/layers/base')

  await page.getByRole('button', { exact: true, name: 'Open local layer' }).click()
  await expect(page.getByText('Local layer', { exact: true })).toBeVisible()
  await expect(page.locator('#local-note')).toHaveText('local')
  await expect(page.locator('#local-errors')).toHaveText('object')
  await expect(page).toHaveURL('/layers/base')

  await page.goBack()

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page).toHaveURL('/layers/base')

  await page.goForward()

  await expect(page.getByText('Local layer', { exact: true })).toBeVisible()
  await expect(page.locator('#local-note')).toHaveText('local')
  await expect(page).toHaveURL('/layers/base')
})

test('a layer opened without moving the address is a history step too', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel without moving the address', '/layers/counted/panel', 'button')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page).toHaveURL('/layers/base')

  await page.goBack()

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page).toHaveURL('/layers/base')

  await page.goForward()

  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page).toHaveURL('/layers/base')
})

test('closing a layer above one that owns no address leaves it standing', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel without moving the address', '/layers/counted/panel', 'button')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()

  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open child layer' }).click()
  await expect(page.getByText('Child layer', { exact: true })).toBeVisible()
  await expect(page.locator('#layer-count')).toHaveText('2')

  await page.keyboard.press('Escape')

  await expect(page.locator('#layer-count')).toHaveText('1')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page).toHaveURL('/layers/base')
})

test('an instant visit inside a layer renders in the layer, leaving the page beneath standing', async ({ page }) => {
  await page.goto('/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()

  requests.listen(page)
  await page.getByRole('button', { name: 'Instantly open the next panel' }).click()

  // The placeholder is up before the server has answered: the layer is still the only one on the
  // stack, and the page beneath it was never torn down to make room for it.
  await expect(page).toHaveURL('/layers/panel/second?delay=500')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Base page')).toBeVisible()

  await expect(page.getByText('Panel layer: second')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Base page')).toBeVisible()

  // Nothing went back for the base, which is what a cold reopen would have had to do.
  expect(requests.requests.filter((request) => request.url().includes('/layers/base'))).toHaveLength(0)
})

test('a layer that owns no address still reloads itself, not the page beneath', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel without moving the address', '/layers/counted/panel', 'button')
  await expect(page.getByTestId('panel-count')).toHaveText('1')

  await clickAndWaitForResponse(page, 'Partial reload panel', '/layers/counted/panel', 'button')

  await expect(page.getByTestId('panel-count')).toHaveText('2')
  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page).toHaveURL('/layers/base')
})

test('a cancelled layer open fires the handle onClose', async ({ page }) => {
  await page.goto('/layers/base')

  // The panel route holds its response, so the visit can be cancelled while it is still out.
  await page.getByRole('button', { exact: true, name: 'Open cancelled panel' }).click()
  await page.evaluate(() => (window as any).testing.Inertia.cancelAll())

  await expect(page.locator('#cancelled-event')).toHaveText('closed')
})

test('a programmatic close refreshes the base beneath it', async ({ page }) => {
  await page.goto('/layers/counted/base')
  await expect(page.locator('#likes')).toHaveText('0')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(page.locator('#likes')).toHaveText('1')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Panel layer: first')).toBeHidden()
})

test('closing a cold-opened layer refreshes the base the walk fetched beneath it', async ({ page }) => {
  await page.goto('/')
  await page.goto('/layers/counted/panel')

  await expect(page.getByText('Panel layer: counted')).toBeVisible()
  await expect(page.locator('#likes')).toHaveText('0')

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.locator('#likes')).toHaveText('1')
})

test('a write issued alongside a close still lands when it outlives the unwind', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.locator('#likes')).toHaveText('0')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Like and close' }).click()

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page).toHaveURL('/layers/base')

  // The write answers a second after the unwind stepped back over the layer's entry.
  await expect(page.locator('#likes')).toHaveText('1', { timeout: 5000 })
})

test('a background request in flight when a layer closes is left to finish', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.locator('#likes')).toHaveText('0')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Like in the background and close' }).click()

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.locator('#likes')).toHaveText('1', { timeout: 5000 })
})

test('a close: true response closes the layer and the refresh brings the staged flash', async ({ page }) => {
  await page.goto('/layers/close-flash/base')
  await expect(page.locator('#page-flash')).toHaveText('')
  const likesBefore = await page.locator('#likes').textContent()

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  // The close route stages a flash in a cookie and answers with `close: true`, which the client
  // reads off the wire instead of installing.
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Save and close' }).click()

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Panel layer: first')).toBeHidden()
  await expect(page.locator('#likes')).toHaveText(String(Number(likesBefore) + 1))
  await expect(page.locator('#page-flash')).toHaveText('Saved from the panel')
})

test('a layer open with viewTransition captures the layer, not the document', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox does not support View Transitions API in CI')

  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  // A layer captured as its own boundary gets a ::view-transition-group(inertia-layer-<id>) rather
  // than being folded into the root. Chromium does not surface that group on the transition's
  // animations, so it is sampled through getComputedStyle instead.
  await page.evaluate(() => {
    const w = window as unknown as { __vtCount: number; __vtGroupWidths: string[] }
    w.__vtCount = 0
    w.__vtGroupWidths = []
    const original = document.startViewTransition.bind(document)
    document.startViewTransition = (callback) => {
      w.__vtCount += 1
      const transition = original(callback)
      transition.ready.then(async () => {
        for (let i = 0; i < 20; i++) {
          const groupName = `inertia-layer-${document.querySelector('[data-layer-id]')!.getAttribute('data-layer-id')}`
          w.__vtGroupWidths.push(
            getComputedStyle(document.documentElement, `::view-transition-group(${groupName})`).width,
          )
          await new Promise((resolve) => setTimeout(resolve, 20))
        }
      })
      return transition
    }
  })

  await clickAndWaitForResponse(page, 'Open panel with view transition', '/layers/panel/first', 'button')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  const layerId = await page.locator('[data-layer-id]').getAttribute('data-layer-id')
  expect(layerId).toBeTruthy()

  // Without the wrapper's view-transition-name there is no group, and every sample reads `auto`.
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __vtGroupWidths: string[] }).__vtGroupWidths.some(
          (width) => width !== 'auto' && width !== '',
        ),
      ),
    )
    .toBe(true)

  await expect(page.evaluate(() => (window as unknown as { __vtCount: number }).__vtCount)).resolves.toBe(1)
})

test('a layer component keeps undeclared props off its root element', async ({ page }) => {
  test.skip(process.env.PACKAGE !== 'vue3', 'Fallthrough attributes are a Vue concept')

  await page.goto('/layers/base')
  await page.getByRole('link', { name: 'Open guarded panel' }).click()
  await page.getByRole('button', { name: 'Complete the prompt' }).click()

  await expect(page.locator('#guarded-layer')).toBeVisible()
  await expect(page.locator('#guarded-layer')).not.toHaveAttribute('note')
})

test('a layerless app renders no dialog at all', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.locator('dialog')).toHaveCount(0)
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('the layer dialog traps focus: Tab cycles within it, the background is unreachable', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await expect
    .poll(() => page.evaluate(() => !!document.activeElement?.closest('dialog[data-layer-index="0"]')))
    .toBe(true)

  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')

    expect(
      await page.evaluate(() => {
        const active = document.activeElement

        // WebKit steps through <body> on its way round the cycle, which reaches nothing. What has
        // to hold is that no control behind the layer is ever focused.
        return active === document.body || !!active?.closest('dialog[data-layer-index="0"]')
      }),
    ).toBe(true)
    await expect(page.locator('#note')).not.toBeFocused()
  }
})

test('closing a layer hands focus back to what opened it', async ({ page }) => {
  await page.goto('/layers/base')
  const trigger = page.getByRole('link', { name: 'Open panel', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Panel layer: first')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  await expect(trigger).toBeFocused()
})

test('Escape dismisses the top layer', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Panel layer: first')).toBeHidden()
  await expect(page.getByText('Base page')).toBeVisible()
})

test('Escape closes the top layer only; the one beneath stays open and modal', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()
  await expect(page.locator('[data-layer-index]')).toHaveCount(2)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.getByText('Panel layer: second')).toBeHidden()
  await expect(page.getByText('Panel layer: first')).toBeVisible()
  await expect(
    page.evaluate(() => document.querySelector('dialog[data-layer-index="0"]')?.matches(':modal')),
  ).resolves.toBe(true)
})

test('an open layer locks the background scroll, and the lock lifts only when the last one closes', async ({
  page,
}) => {
  await page.goto('/layers/base')
  await page.evaluate(() => window.scrollTo(0, 300))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  // Inertness blocks clicks and focus but not scrolling, so the lock is explicit: the root carries
  // overflow:hidden while any layer is open, ref-counted across the stack.
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await page.locator('[data-layer-index="0"]').getByRole('button', { name: 'Open next panel' }).click()
  await expect(page.locator('[data-layer-index]')).toHaveCount(2)
  await expect(page.evaluate(() => document.documentElement.style.overflow)).resolves.toBe('hidden')

  const before = await page.evaluate(() => window.scrollY)
  await page.keyboard.press('PageDown')
  await page.mouse.move(400, 300)
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.scrollY)).toBe(before)

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  await expect(page.evaluate(() => document.documentElement.style.overflow)).resolves.toBe('hidden')

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.evaluate(() => document.documentElement.style.overflow)).resolves.toBe('')
  const afterClose = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(afterClose)
})

test('the layer dialog is modal, has the dialog role, and is named after the layer it renders', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')

  await expect(page.getByRole('dialog', { name: 'Layers/Panel' })).toBeVisible()
  await expect(page.evaluate(() => document.querySelector('dialog')?.matches(':modal'))).resolves.toBe(true)
})

test('a closing layer stays mounted until its exit completes, then is removed', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  // A 400ms exit transition makes the closing window observable.
  await page.addStyleTag({ content: 'dialog[data-layer-closing="true"] { opacity: 0; transition: opacity 400ms }' })
  await page.keyboard.press('Escape')

  await expect(page.locator('dialog[data-layer-closing="true"]')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.waitForTimeout(150)
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('a closing layer waits for an exit that animates a panel inside the dialog', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.addStyleTag({
    content: 'dialog[data-layer-closing="true"] [data-layer-id] { opacity: 0; transition: opacity 400ms }',
  })
  await page.keyboard.press('Escape')

  await page.waitForTimeout(150)
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('an exit animation that holds its end state ends the close, rather than the exit timing out', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  // `forwards` keeps the animation listed once it has ended, which is what any real shell writes.
  await page.addStyleTag({
    content: `@keyframes layer-out { to { opacity: 0 } }
      dialog[data-layer-closing="true"] { animation: layer-out 400ms forwards }`,
  })

  const started = Date.now()
  await page.keyboard.press('Escape')

  await page.waitForTimeout(150)
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  expect(Date.now() - started).toBeLessThan(1200)
})

test('an exit animation on a panel inside the dialog ends the close, rather than the exit timing out', async ({
  page,
}) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.addStyleTag({
    content: `@keyframes layer-out { to { opacity: 0 } }
      dialog[data-layer-closing="true"] [data-layer-id] { animation: layer-out 200ms forwards }`,
  })

  const started = Date.now()
  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  expect(Date.now() - started).toBeLessThan(1000)
})

test('an endless animation inside the dialog does not hold the exit open', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.addStyleTag({
    content: `@keyframes layer-spin { to { transform: rotate(360deg) } }
      @keyframes layer-out { to { opacity: 0 } }
      dialog [data-layer-id] { animation: layer-spin 600ms linear infinite }
      dialog[data-layer-closing="true"] { animation: layer-out 200ms forwards }`,
  })

  const started = Date.now()
  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  expect(Date.now() - started).toBeLessThan(1000)
})

test('with a layer open, a reload shows the progress bar and Escape still closes the layer', async ({ page }) => {
  await page.goto('/layers/base')
  await clickAndWaitForResponse(page, 'Open panel', '/layers/panel/first')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  // Hold the base response so the reload's progress bar is observable.
  let releaseTheBase!: () => void
  const held = new Promise<void>((resolve) => (releaseTheBase = resolve))
  await page.route('**/layers/base', async (route) => {
    await held
    await route.continue()
  })

  await page.evaluate(() => {
    window.testing.Inertia.reload()
  })

  await expect(page.locator('#nprogress .bar')).toHaveCount(1)
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)

  releaseTheBase()
})

test('completing an interstitial prompt opens the layer over the page it was requested from', async ({ page }) => {
  await page.goto('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()

  requests.listen(page)
  await page.evaluate(() => {
    ;(window as any).testing.guardedHandle = (window as any).testing.Inertia.layer('/layers/guarded')
  })
  await expect(page.getByText('Sudo prompt')).toBeVisible()
  await expect(page.getByText('Base page')).toBeHidden()

  await page.getByRole('button', { name: 'Complete the prompt' }).click()

  await expect(page.getByText('Guarded layer')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Sudo prompt')).toBeHidden()
  expect(await page.evaluate(() => window.history.state.page.component)).toBe('Layers/Base')
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
  expect(requests.requests.filter((request) => request.url().includes('/layers/base'))).toHaveLength(0)

  await page.evaluate(() => window.testing.Inertia.close((window as any).testing.guardedHandle.id))
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('a layer open answered by an ordinary page closes the handle', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => {
    const handle = window.testing.Inertia.layer('/layers/settings')
    handle.onClose(() => {
      ;(window as any).unmarkedHandleClosed = true
    })
  })
  await expect(page.locator('#login-page')).toBeVisible()

  expect(await page.evaluate(() => (window as any).unmarkedHandleClosed)).toBe(true)
})

test('a visit made while the prompt is showing still opens the layer over the page beneath it', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => {
    ;(window as any).testing.Inertia.layer('/layers/guarded')
  })
  await expect(page.getByText('Sudo prompt')).toBeVisible()

  await page.context().addCookies([{ name: 'layers-confirmed', value: '1', domain: 'localhost', path: '/' }])
  await page.evaluate(() => window.testing.Inertia.visit('/layers/guarded'))

  await expect(page.getByText('Guarded layer')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Sudo prompt')).toBeHidden()
  expect(await page.evaluate(() => window.history.state.page.component)).toBe('Layers/Base')
})

test('a second open after the prompt completes uses the page on screen, not the earlier one', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => {
    ;(window as any).testing.guardedHandle = (window as any).testing.Inertia.layer('/layers/guarded')
  })
  await expect(page.getByText('Sudo prompt')).toBeVisible()
  await page.getByRole('button', { name: 'Complete the prompt' }).click()
  await expect(page.getByText('Guarded layer')).toBeVisible()

  await page.evaluate(() => window.testing.Inertia.close((window as any).testing.guardedHandle.id))
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await page.evaluate(() => window.testing.Inertia.visit('/layers/counted/base'))
  // Both bases render Layers/Base, so the text is already on screen: the address is what says the
  // second one has landed, and the layer below has to open over it rather than over the first.
  await expect(page).toHaveURL('/layers/counted/base')
  await page.evaluate(() => window.testing.Inertia.visit('/layers/guarded'))
  await expect(page.getByText('Guarded layer')).toBeVisible()
  expect(await page.evaluate(() => window.history.state.page.url)).toBe('/layers/counted/base')
})

test('navigating away from the prompt ends it, so the next open uses the page on screen', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => {
    ;(window as any).testing.Inertia.layer('/layers/guarded')
  })
  await expect(page.getByText('Sudo prompt')).toBeVisible()

  await page.evaluate(() => window.testing.Inertia.visit('/layers/counted/base'))
  await expect(page.getByText('Base page')).toBeVisible()
  await page.context().addCookies([{ name: 'layers-confirmed', value: '1', domain: 'localhost', path: '/' }])
  await page.evaluate(() => window.testing.Inertia.visit('/layers/guarded'))
  await expect(page.getByText('Guarded layer')).toBeVisible()
  expect(await page.evaluate(() => window.history.state.page.url)).toBe('/layers/counted/base')
})

test('reloading during the prompt forgets the page the layer was opened from', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => {
    ;(window as any).testing.Inertia.layer('/layers/guarded')
  })
  await expect(page.getByText('Sudo prompt')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Sudo prompt')).toBeVisible()
  requests.listen(page)
  await page.getByRole('button', { name: 'Complete the prompt' }).click()
  await expect(page.getByText('Guarded layer')).toBeVisible()

  // The walk for the base is sent once the layer has landed, so it trails the render it follows.
  await expect.poll(() => requests.requests.filter((request) => request.url().includes('/layers/base')).length).toBe(1)
})

test('a layer opened by a visit returns over the page beneath, and back skips the prompt', async ({ page }) => {
  await page.goto('/layers/base')

  requests.listen(page)
  await page.evaluate(() => window.testing.Inertia.visit('/layers/guarded'))
  await expect(page.getByText('Sudo prompt')).toBeVisible()
  await expect(page.getByText('Base page')).toBeHidden()

  await page.getByRole('button', { name: 'Complete the prompt' }).click()

  await expect(page.getByText('Guarded layer')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  expect(await page.evaluate(() => window.history.state.page.component)).toBe('Layers/Base')
  expect(requests.requests.filter((request) => request.url().includes('/layers/base'))).toHaveLength(0)

  await page.goBack()

  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Sudo prompt')).toBeHidden()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('a layer opened by a link returns over the page beneath, and back skips the prompt', async ({ page }) => {
  await page.goto('/layers/base')

  await clickAndWaitForResponse(page, 'Open guarded panel', '/layers/guarded')
  await expect(page.getByText('Sudo prompt')).toBeVisible()

  await page.getByRole('button', { name: 'Complete the prompt' }).click()

  await expect(page.getByText('Guarded layer')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()

  await page.goBack()

  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Sudo prompt')).toBeHidden()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('the back button from a layer opened through a prompt lands on the page, not the prompt', async ({ page }) => {
  await page.goto('/layers/base')

  await page.evaluate(() => {
    ;(window as any).testing.guardedHandle = (window as any).testing.Inertia.layer('/layers/guarded')
  })
  await expect(page.getByText('Sudo prompt')).toBeVisible()
  await page.getByRole('button', { name: 'Complete the prompt' }).click()
  await expect(page.getByText('Guarded layer')).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Sudo prompt')).toBeHidden()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
})

test('a layer response that is also an interstitial still opens as a layer', async ({ page }) => {
  await page.goto('/layers/base')
  await page.context().addCookies([{ name: 'layers-confirmed', value: '1', domain: 'localhost', path: '/' }])

  await page.evaluate(() => window.testing.Inertia.visit('/layers/guarded?mark'))

  await expect(page.getByText('Guarded layer')).toBeVisible()
  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.getByText('Sudo prompt')).toBeHidden()
  await expect(page.locator('[data-layer-index]')).toHaveCount(1)
})

test('an interstitial response with no layer open renders as an ordinary page', async ({ page }) => {
  await page.goto('/layers/prompt')

  await expect(page.getByText('Sudo prompt')).toBeVisible()
  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  expect(await page.evaluate(() => window.history.state.page.component)).toBe('Layers/Prompt')
})

// The rows below opt into the loading placeholder. The test apps resolve one only for bases under
// /layers/loading, and record every consultation, so the rows above keep today's blank.

test('the loading placeholder renders beneath a cold-opened layer until the walk lands the base', async ({ page }) => {
  // Firefox does not fire load while the walk's request is out, so the navigation waits for commit.
  await page.goto('/layers/loading/panel', { waitUntil: 'commit' })

  await expect(page.getByText('Panel layer: loading')).toBeVisible()
  await expect(page.locator('#loading-base')).toBeVisible()
  await expect(page.getByText('Base page')).toBeHidden()
  expect(await page.evaluate(() => window.loadingResolved)).toBe('/layers/loading/base?delay=1500|loading-panel')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#loading-base')).toHaveCount(0)
  await expect(page.getByText('Panel layer: loading')).toBeVisible()
})

test('a layer dismissed while its base is loading leaves the placeholder, and the base swaps it in', async ({
  page,
}) => {
  await page.goto('/layers/loading/panel', { waitUntil: 'commit' })
  await expect(page.locator('#loading-base')).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.locator('#loading-base')).toBeVisible()

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#loading-base')).toHaveCount(0)
})

test('a stack opened cold renders one placeholder, not one per layer', async ({ page }) => {
  await page.goto('/layers/loading/chain/outer', { waitUntil: 'commit' })

  await expect(page.locator('[data-layer-index]')).toHaveCount(2)
  await expect(page.locator('#loading-base')).toHaveCount(1)

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#loading-base')).toHaveCount(0)
})

test('closing the layer while the base component is still importing still leaves the base on screen', async ({
  page,
}) => {
  // The walk is held so the dismissal can be timed: once it answers, the base's component import
  // (which the resolver delays) is what holds the landing open, and the Escape lands inside that
  // window, superseding it. The walk must then be sent again rather than left spent.
  let releaseWalk!: () => void
  const held = new Promise<void>((resolve) => (releaseWalk = resolve))
  await page.route('**/layers/loading/slow-import', async (route) => {
    await held
    await route.continue()
  })

  await page.goto('/layers/loading/slow-import/panel', { waitUntil: 'commit' })
  await expect(page.locator('#loading-base')).toBeVisible()

  const answered = page.waitForResponse('**/layers/loading/slow-import')
  releaseWalk()
  await answered
  await page.keyboard.press('Escape')

  await expect(page.locator('[data-layer-index]')).toHaveCount(0)
  await expect(page.getByText('Slow import base')).toBeVisible()
  await expect(page.locator('#loading-base')).toHaveCount(0)
})

test('a layer opened over a page on screen never consults the loading resolver', async ({ page }) => {
  await page.goto('/layers/loading/base')
  await expect(page.getByText('Base page')).toBeVisible()

  await page.evaluate(() => window.testing.Inertia.visit('/layers/loading/panel'))

  await expect(page.getByText('Panel layer: loading')).toBeVisible()
  await expect(page.locator('#loading-base')).toHaveCount(0)
  expect(await page.evaluate(() => window.loadingResolved)).toBeUndefined()
})

test('an ordinary navigation never consults the loading resolver, not even before the app initialises', async ({
  page,
}) => {
  await page.goto('/layers/loading/base')

  await expect(page.getByText('Base page')).toBeVisible()
  await expect(page.locator('#loading-base')).toHaveCount(0)
  expect(await page.evaluate(() => window.loadingResolved)).toBeUndefined()

  await page.evaluate(() => window.testing.Inertia.visit('/layers/base'))

  await expect(page).toHaveURL('/layers/base')
  await expect(page.getByText('Base page')).toBeVisible()
  expect(await page.evaluate(() => window.loadingResolved)).toBeUndefined()
})
