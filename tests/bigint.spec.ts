import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test('it decodes integers beyond the safe range as native BigInt values without losing precision', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/')
  await page.evaluate(() => (window as any).testing.Inertia.visit('/bigint'))

  await expect(page.locator('#safe')).toHaveText('42')
  await expect(page.locator('#safe-type')).toHaveText('number')

  await expect(page.locator('#big')).toHaveText('900719925474099988')
  await expect(page.locator('#big-type')).toHaveText('bigint')

  await expect(page.locator('#negative')).toHaveText('-900719925474099988')
  await expect(page.locator('#huge')).toHaveText('9223372036854775807')
  await expect(page.locator('#nested')).toHaveText('900719925474099988,2')

  await page.getByRole('button', { name: 'Load reload data' }).click()

  await expect(page.locator('#safe')).toHaveText('100')
  await expect(page.locator('#big')).toHaveText('123456789012345678')

  await page.goBack()

  await expect(page.locator('#safe')).toHaveText('42')
  await expect(page.locator('#big')).toHaveText('900719925474099988')

  await page.getByRole('button', { name: 'Submit echo' }).click()

  await expect(page.locator('#big')).toHaveText('111222333444555666')
  await expect(page.locator('#echoed-type')).toHaveText('string')
})

;[
  { history: 'encrypted', query: '' },
  { history: 'unencrypted', query: '?encrypt=false' },
].forEach(({ history, query }) => {
  test(`it restores big integers on back and forward navigation (${history})`, async ({ page }) => {
    pageLoads.watch(page)

    await page.goto('/')
    await page.evaluate((url) => (window as any).testing.Inertia.visit(url), `/bigint${query}`)

    await expect(page.locator('#big-type')).toHaveText('bigint')

    if (history === 'encrypted') {
      await expect.poll(() => page.evaluate(() => window.history.state?.page instanceof ArrayBuffer)).toBe(true)

      const decryptedType = await page.evaluate(
        async () => typeof (await (window as any).testing.Inertia.decryptHistory()).props.big,
      )
      expect(decryptedType).toBe('bigint')
    } else {
      await expect.poll(() => page.evaluate(() => typeof window.history.state?.page?.props?.big)).toBe('bigint')
    }

    await page.evaluate((url) => (window as any).testing.Inertia.visit(url), `/bigint/reload${query}`)

    await expect(page.locator('#big')).toHaveText('123456789012345678')

    await page.goBack()

    await expect(page.locator('#safe')).toHaveText('42')
    await expect(page.locator('#big')).toHaveText('900719925474099988')
    await expect(page.locator('#big-type')).toHaveText('bigint')
    await expect(page.locator('#nested')).toHaveText('900719925474099988,2')

    await page.goForward()

    await expect(page.locator('#safe')).toHaveText('100')
    await expect(page.locator('#big')).toHaveText('123456789012345678')
    await expect(page.locator('#big-type')).toHaveText('bigint')
  })
})

test('it revives markers built by the app on pages that preserve big integers', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/')
  await page.evaluate(() => (window as any).testing.Inertia.visit('/bigint/collision'))

  await expect(page.locator('#collision-type')).toHaveText('bigint')
  await expect(page.locator('#collision')).toHaveText('123')
})

test('it leaves markers built by the app untouched when the page did not opt in', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/')
  await page.evaluate(() => (window as any).testing.Inertia.visit('/bigint/unflagged'))

  await expect(page.locator('#collision-type')).toHaveText('object')
  await expect(page.locator('#collision')).toHaveText('123')

  await page.getByRole('button', { name: 'Load reload data' }).click()
  await expect(page.locator('#safe')).toHaveText('100')

  await page.goBack()

  await expect(page.locator('#collision-type')).toHaveText('object')
  await expect(page.locator('#collision')).toHaveText('123')
})
