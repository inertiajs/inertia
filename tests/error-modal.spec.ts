import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

const elements = ['dialog', 'div']

elements.forEach((element) => {
  test.describe(`modal using the <${element}> element`, () => {
    test.beforeEach(async ({ page }) => {
      pageLoads.watch(page)
      await page.goto(element === 'dialog' ? '/error-modal?dialog=1' : '/error-modal')
    })

    test('uses the correct element', async ({ page }) => {
      await page.getByText('Invalid Visit', { exact: true }).click()

      if (element === 'dialog') {
        await expect(page.locator('dialog#inertia-error-dialog > iframe')).toBeVisible()
      } else {
        await expect(page.locator('div > iframe')).toBeVisible()
      }
    })

    test('displays the modal containing the response as HTML when an invalid Inertia response comes back', async ({
      page,
    }) => {
      await page.getByText('Invalid Visit', { exact: true }).click()
      await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
      await expect(page.frameLocator('iframe').locator('body')).toContainText(
        'This is a page that does not have the Inertia app loaded.',
      )
    })

    test('displays the modal with a helpful message when a regular JSON response comes back instead of an Inertia response', async ({
      page,
    }) => {
      await page.getByText('Invalid Visit (JSON response)').click()
      await expect(page.frameLocator('iframe').locator('body')).toContainText(
        'All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.',
      )
      await page.frameLocator('iframe').getByText('All Inertia requests must').click()
      await expect(page.frameLocator('iframe').locator('body')).toContainText('{"foo":"bar"}')
    })

    test('can close the modal using the escape key', async ({ page }) => {
      await page.getByText('Invalid Visit', { exact: true }).click()
      await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
      await page.locator('body').press('Escape')
      await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()
    })

    test('closes the modal when clicking outside of it', async ({ page }) => {
      await page.getByText('Invalid Visit', { exact: true }).click()
      await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
      await page.mouse.click(25, 25)
      await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()
    })
  })
})

test('it preserves a stylesheet-defined body overflow when closing the div modal', async ({ page }) => {
  pageLoads.watch(page)
  await page.goto('/error-modal/body-overflow-stylesheet')
  await page.waitForFunction(() => !!document.getElementById('body-overflow-style'))

  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).toBe('scroll')

  await page.getByText('Invalid Visit', { exact: true }).click()
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()

  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

  await page.mouse.click(25, 25)
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()

  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).toBe('scroll')
})

test('it restores a caller-set inline body overflow when closing the div modal', async ({ page }) => {
  pageLoads.watch(page)
  await page.goto('/error-modal/body-overflow-inline')
  await page.waitForFunction(() => document.body.style.overflow === 'scroll')

  expect(await page.evaluate(() => document.body.style.overflow)).toBe('scroll')

  await page.getByText('Invalid Visit', { exact: true }).click()
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()

  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

  await page.mouse.click(25, 25)
  await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()

  expect(await page.evaluate(() => document.body.style.overflow)).toBe('scroll')
})

test('it does not execute scripts in the error dialog iframe', async ({ page }) => {
  pageLoads.watch(page)
  await page.goto('/error-modal?dialog=1')
  await page.getByText('Invalid Visit (XSS)', { exact: true }).click()
  await expect(page.locator('dialog#inertia-error-dialog > iframe')).toBeVisible()
  const xssExecuted = await page.evaluate(() => (window as any).xssExecuted)
  expect(xssExecuted).toBeUndefined()
})
