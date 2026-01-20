import { expect, test } from '@playwright/test'

test.describe('getScrollableParent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scrollable-parent')
  })

  test.describe('no scrollable parent', () => {
    test('overflow-x: hidden is not a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-x-hidden')).toHaveText('null')
    })

    test('overflow-y: auto without height is not a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-y-auto-no-height')).toHaveText('null')
    })

    test('overflow: auto without constraints is not a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-auto-no-constraints')).toHaveText('null')
    })

    test('overflow: clip is not a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-clip')).toHaveText('null')
    })

    test('overflow-y: auto with overflow-x: hidden and no height is not a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-y-auto-overflow-x-hidden')).toHaveText('null')
    })

    test('overflow-x: auto with overflow-y: hidden and no width is not a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-x-auto-overflow-y-hidden')).toHaveText('null')
    })
  })

  test.describe('has scrollable parent', () => {
    test('overflow-x: scroll is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-x-scroll')).toHaveText('scroll-container-x')
    })

    test('overflow-y: auto with height is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-y-auto')).toHaveText('scroll-container-y')
    })

    test('overflow-x: scroll, overflow-y: hidden is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-x-scroll-y-hidden')).toHaveText('scroll-container-x-y-hidden')
    })

    test('overflow-x: scroll with max-width is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-horizontal-scroll-calc')).toHaveText('scroll-container-max-width')
    })

    test('overflow-y: auto with max-height is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-vertical-scroll-max-height')).toHaveText('scroll-container-max-height')
    })

    test('finds nearest scrollable parent in nested containers', async ({ page }) => {
      await expect(page.getByTestId('result-nested-scroll')).toHaveText('inner-scroll')
    })

    test('flex horizontal carousel is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-flex-horizontal-carousel')).toHaveText('flex-carousel')
    })

    test('overflow-x: scroll with coerced overflow-y auto is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-coerced-auto-no-constraint')).toHaveText('coerced-auto')
    })

    test('display: contents is skipped and finds parent scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-display-contents')).toHaveText('scroll-container-skip-contents')
    })

    test('overflow: overlay is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-overlay')).toHaveText('scroll-container-overlay')
    })

    test('overflow-x: auto with inline width is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-inline-width-style')).toHaveText('inline-width-container')
    })

    test('overflow: scroll in both directions is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-both-scroll-directions')).toHaveText('both-scroll')
    })

    test('overflow-y: auto with overflow-x: visible is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-y-auto-overflow-x-visible')).toHaveText(
        'overflow-y-auto-x-visible',
      )
    })

    test('overflow-y: auto with overflow-x: clip is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-y-auto-overflow-x-clip')).toHaveText('overflow-y-auto-x-clip')
    })

    test('overflow-x: auto with overflow-y: visible is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-x-auto-overflow-y-visible')).toHaveText(
        'overflow-x-auto-y-visible',
      )
    })

    test('overflow-x: auto with overflow-y: clip is a scroll container', async ({ page }) => {
      await expect(page.getByTestId('result-overflow-x-auto-overflow-y-clip')).toHaveText('overflow-x-auto-y-clip')
    })
  })
})
