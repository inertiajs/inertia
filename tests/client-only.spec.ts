import { expect, test } from '@playwright/test'
import { clickLinkAndGoBack, clientOnlyProbe, consoleMessages, pageLoads } from './support'

test.describe('ClientOnly', () => {
  test('it renders the children once mounted', async ({ page }) => {
    consoleMessages.listen(page)

    await page.goto('/client-only')

    // A pure CSR app should never render the fallback at all -- there is no
    // hydration pass to guard against.
    await clientOnlyProbe.expectRendered(page, 'Client path: /client-only')

    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it renders the children again after navigating back to the page', async ({ page }) => {
    await page.goto('/client-only')
    await expect(page.getByTestId('client-only-content')).toBeVisible()

    await page.goto('/dump/get')
    await page.goBack()

    await clientOnlyProbe.expectRendered(page, 'Client path: /client-only')
  })

  test('revisiting the same page never shows the fallback', async ({ page }) => {
    pageLoads.watch(page, 1)

    await page.goto('/client-only')
    await clientOnlyProbe.reset(page)

    await page.getByTestId('revisit-link').click()

    await clientOnlyProbe.expectRendered(page, 'Client path: /client-only')

    // Confirm this was a real SPA navigation, not a full document reload.
    expect(pageLoads.count).toBe(1)
  })

  test('navigating away and back never re-shows the fallback', async ({ page }) => {
    pageLoads.watch(page, 1)

    await page.goto('/client-only')
    await clientOnlyProbe.reset(page)

    await clickLinkAndGoBack(page, 'leave-link', () =>
      expect(page.getByText('This is the Test App Entrypoint page')).toBeVisible(),
    )

    await clientOnlyProbe.expectRendered(page, 'Client path: /client-only')

    // Confirm this was a real SPA navigation, not a full document reload.
    expect(pageLoads.count).toBe(1)
  })

  test('a preserveState visit keeps the ClientOnly child subtree mounted', async ({ page }) => {
    await page.goto('/client-only')
    await expect(page.getByTestId('child-status')).toHaveText('ready')
    await clientOnlyProbe.reset(page)

    await page.getByTestId('child-increment').click()
    await expect(page.getByTestId('child-count')).toHaveText('1')

    await page.getByTestId('preserve-state-link').click()
    await expect(page.getByTestId('client-only-content')).toHaveText('Client path: /client-only')

    // The subtree was never destroyed, so local state and the mount count are unchanged.
    await expect(page.getByTestId('child-count')).toHaveText('1')
    expect(await clientOnlyProbe.childMounts(page)).toBe(0)
    expect(await clientOnlyProbe.fallbackRenders(page)).toBe(0)
  })

  test('an ordinary revisit remounts the child but never shows the fallback', async ({ page }) => {
    pageLoads.watch(page, 1)

    await page.goto('/client-only')
    await expect(page.getByTestId('child-status')).toHaveText('ready')
    await clientOnlyProbe.reset(page)

    await page.getByTestId('child-increment').click()
    await expect(page.getByTestId('child-count')).toHaveText('1')

    // This is a page-keying remount, not a ClientOnly bug -- the fix only prevents
    // the fallback from reappearing, it does not (and should not) prevent the remount.
    await page.getByTestId('revisit-link').click()
    await expect(page.getByTestId('client-only-content')).toHaveText('Client path: /client-only')

    await expect(page.getByTestId('child-count')).toHaveText('0')
    expect(await clientOnlyProbe.childMounts(page)).toBe(1)
    expect(await clientOnlyProbe.fallbackRenders(page)).toBe(0)
    await expect(page.getByTestId('child-status')).toHaveText('ready')

    // Confirm this was a real SPA navigation, not a full document reload.
    expect(pageLoads.count).toBe(1)
  })
})
