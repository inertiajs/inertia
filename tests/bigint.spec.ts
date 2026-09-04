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
})

test('it treats the marker as a reserved wire shape once big integers are enabled', async ({ page }) => {
  pageLoads.watch(page)

  await page.goto('/')
  await page.evaluate(() => (window as any).testing.Inertia.visit('/bigint/collision'))

  await expect(page.locator('#collision-type')).toHaveText('bigint')
  await expect(page.locator('#collision')).toHaveText('123')
})
