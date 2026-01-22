import { expect, Locator, test } from '@playwright/test'

const getProgressPercent = async (bar: Locator) => {
  return await bar.evaluate((element) => {
    // Get the inline style transform value which has the original percentage
    const inlineTransform = element.style.transform

    if (!inlineTransform || inlineTransform === 'none') {
      return 0
    }

    // Extract percentage from translate3d(-75%, 0px, 0px)
    const match = inlineTransform.match(/translate3d\((-?\d+(?:\.\d+)?)%/)
    return match ? parseFloat(match[1]) : 0
  })
}

test.describe('Progress Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/progress-component')
  })

  test('start() creates nprogress bar and begins auto-animation', async ({ page }) => {
    await expect(page.locator('#nprogress .bar')).not.toBeVisible()

    await page.getByRole('button', { name: 'Start', exact: true }).click()

    const bar = page.locator('#nprogress .bar')
    const peg = page.locator('#nprogress .peg')

    await expect(bar).toBeVisible()
    await expect(peg).toBeVisible()

    const initialTransform = await getProgressPercent(bar)
    await expect(initialTransform).toBeLessThan(-70)

    await page.waitForTimeout(300)
    const afterTrickle = await getProgressPercent(bar)

    await expect(afterTrickle).toBeGreaterThan(initialTransform)
  })

  test('set() without start() directly updates bar position', async ({ page }) => {
    await page.getByRole('button', { name: 'Set 25%' }).click()

    const bar = page.locator('#nprogress .bar')
    await expect(bar).toBeVisible()

    const transform25 = await getProgressPercent(bar)
    await expect(transform25).toBeCloseTo(-75, 1)

    await page.getByRole('button', { name: 'Set 50%' }).click()
    const transform50 = await getProgressPercent(bar)
    await expect(transform50).toBeCloseTo(-50, 1)

    await page.getByRole('button', { name: 'Set 75%' }).click()
    const transform75 = await getProgressPercent(bar)
    await expect(transform75).toBeCloseTo(-25, 1)
  })

  test('finish() animates to 100% then fades out and removes bar', async ({ page }) => {
    test.setTimeout(10_000)
    await page.getByRole('button', { name: 'Set 25%' }).click()

    const bar = page.locator('#nprogress .bar')
    await expect(bar).toBeVisible()

    const beforeFinish = await getProgressPercent(bar)
    await expect(beforeFinish).toBeCloseTo(-75, 1)

    await page.getByRole('button', { name: 'Finish' }).click()

    await page.waitForTimeout(100)

    const duringFinish = await getProgressPercent(bar)
    await expect(duringFinish).toBeGreaterThan(-75)

    await page.waitForFunction(
      () => {
        const bar = document.querySelector('#nprogress .bar') as HTMLElement
        const transform = bar?.style.transform

        const match = transform?.match(/translate3d\((-?\d+(?:\.\d+)?)%/)

        return match && Math.abs(parseFloat(match[1])) < 1
      },
      {},
      { timeout: 3000 },
    )

    const at100 = await getProgressPercent(bar)
    await expect(at100).toBeCloseTo(0, 1)

    await expect(bar).not.toBeVisible()
  })

  test('reset() resets status to 0', async ({ page }) => {
    await page.getByRole('button', { name: 'Set 50%' }).click()

    const bar = page.locator('#nprogress .bar')
    const transform50 = await getProgressPercent(bar)
    await expect(transform50).toBeCloseTo(-50, 1)

    await page.getByRole('button', { name: 'Reset' }).click()

    const transform0 = await getProgressPercent(bar)
    await expect(transform0).toBeLessThan(-70)
  })

  test('remove() completes and removes nprogress bar', async ({ page }) => {
    await page.getByRole('button', { name: 'Start', exact: true }).click()
    await page.getByRole('button', { name: 'Set 75%' }).click()

    await expect(page.locator('#nprogress .bar')).toBeVisible()

    await page.getByRole('button', { name: 'Remove' }).click()

    await page.waitForTimeout(500)
    await expect(page.locator('#nprogress .bar')).not.toBeVisible()
  })

  test('hide() and reveal() control nprogress visibility', async ({ page }) => {
    await page.getByRole('button', { name: 'Start', exact: true }).click()

    await expect(page.locator('#nprogress .bar')).toBeVisible()

    await page.getByRole('button', { name: 'Hide' }).click()

    await expect(page.locator('#nprogress .bar')).not.toBeVisible()

    await page.getByRole('button', { name: 'Reveal' }).click()

    await expect(page.locator('#nprogress .bar')).toBeVisible()
  })

  test('multiple hide() calls require multiple reveal() calls', async ({ page }) => {
    await page.getByRole('button', { name: 'Start', exact: true }).click()
    await expect(page.locator('#nprogress .bar')).toBeVisible()

    await page.getByRole('button', { name: 'Hide' }).click()
    await page.getByRole('button', { name: 'Hide' }).click()
    await expect(page.locator('#nprogress .bar')).not.toBeVisible()

    await page.getByRole('button', { name: 'Reveal' }).click()
    await expect(page.locator('#nprogress .bar')).not.toBeVisible()

    await page.getByRole('button', { name: 'Reveal' }).click()
    await expect(page.locator('#nprogress .bar')).toBeVisible()
  })

  test('isStarted() reflects actual DOM state', async ({ page }) => {
    await page.getByRole('button', { name: 'Is Started' }).click()
    let tests = await page.evaluate(() => (window as any).progressTests)
    let isStarted = tests[tests.length - 1]
    await expect(isStarted).toBe(false)
    await expect(page.locator('#nprogress .bar')).not.toBeVisible()

    await page.getByRole('button', { name: 'Clear' }).click()
    await page.getByRole('button', { name: 'Start', exact: true }).click()
    await page.getByRole('button', { name: 'Is Started' }).click()
    tests = await page.evaluate(() => (window as any).progressTests)
    isStarted = tests[tests.length - 1]
    await expect(isStarted).toBe(true)
    await expect(page.locator('#nprogress .bar')).toBeVisible()

    await page.getByRole('button', { name: 'Finish' }).click()
    await page.getByRole('button', { name: 'Is Started' }).click()
    tests = await page.evaluate(() => (window as any).progressTests)
    isStarted = tests[tests.length - 1]
    await expect(isStarted).toBe(false)
    await page.waitForTimeout(500)
    await expect(page.locator('#nprogress .bar')).not.toBeVisible()
  })
})
