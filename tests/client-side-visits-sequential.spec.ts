import test, { expect } from '@playwright/test'
import { requests } from './support'

test.describe('Client-side visits with sequential prop updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client-side-visit/sequential')
    requests.listen(page)
  })

  test('replaceProp called sequentially applies all changes', async ({ page }) => {
    await expect(page.getByText('Foo: foo')).toBeVisible()
    await expect(page.getByText('Bar: bar')).toBeVisible()

    await page.getByRole('button', { name: 'Replace foo and bar sequentially' }).click()

    await expect(page.getByText('Foo: baz')).toBeVisible()
    await expect(page.getByText('Bar: qux')).toBeVisible()
    expect(requests.requests.length).toBe(0)
  })
})
