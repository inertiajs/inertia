import { expect, test } from '@playwright/test'
import { consoleMessages } from './support'

test.beforeEach(async ({ page }) => {
  test.skip(process.env.PACKAGE !== 'svelte', 'Svelte-only test')
})

test('props and page store are in sync', async ({ page }) => {
  consoleMessages.listen(page)

  await page.goto('/svelte/props-and-page-store')

  await expect(page.getByText('foo prop is default', { exact: true })).toBeVisible()
  await expect(page.getByText('page.props.foo is default', { exact: true })).toBeVisible()
  await expect(page.getByText('pageProps.foo is default')).toBeVisible()
  await expect(page.getByText('sveltePage.props.foo is default')).toBeVisible()
  await expect(consoleMessages.messages).toHaveLength(12)
  await expect(consoleMessages.messages[0]).toBe('[script] foo prop is default')
  await expect(consoleMessages.messages[1]).toBe('[script] page.props.foo is default')
  await expect(consoleMessages.messages[2]).toBe('[script] sveltePage.props.foo is default')
  await expect(consoleMessages.messages[3]).toBe('[reactive expression] foo prop is default')
  await expect(consoleMessages.messages[4]).toBe('[reactive expression] page.props.foo is default')
  await expect(consoleMessages.messages[5]).toBe('[reactive expression] sveltePage.props.foo is default')
  await expect(consoleMessages.messages[6]).toBe('[onMount] foo prop is default')
  await expect(consoleMessages.messages[7]).toBe('[onMount] page.props.foo is default')
  await expect(consoleMessages.messages[8]).toBe('[onMount] sveltePage.props.foo is default')
  await expect(consoleMessages.messages[9]).toBe('[reactive expression] foo prop is default')
  await expect(consoleMessages.messages[10]).toBe('[reactive expression] page.props.foo is default')
  await expect(consoleMessages.messages[11]).toBe('[reactive expression] sveltePage.props.foo is default')
  await expect(await page.locator('#input').inputValue()).toEqual('default')

  consoleMessages.messages = []
  await page.getByRole('link', { name: 'Bar' }).click()

  await expect(page.getByText('foo prop is bar', { exact: true })).toBeVisible()
  await expect(page.getByText('page.props.foo is bar', { exact: true })).toBeVisible()
  await expect(page.getByText('pageProps.foo is bar')).toBeVisible()
  await expect(page.getByText('sveltePage.props.foo is bar')).toBeVisible()
  await expect(consoleMessages.messages).toHaveLength(9)
  await expect(consoleMessages.messages[0]).toBe('[script] foo prop is bar')
  await expect(consoleMessages.messages[1]).toBe('[script] page.props.foo is bar')
  await expect(consoleMessages.messages[2]).toBe('[script] sveltePage.props.foo is bar')
  await expect(consoleMessages.messages[3]).toBe('[reactive expression] foo prop is bar')
  await expect(consoleMessages.messages[4]).toBe('[reactive expression] page.props.foo is bar')
  await expect(consoleMessages.messages[5]).toBe('[reactive expression] sveltePage.props.foo is bar')
  await expect(consoleMessages.messages[6]).toBe('[onMount] foo prop is bar')
  await expect(consoleMessages.messages[7]).toBe('[onMount] page.props.foo is bar')
  await expect(consoleMessages.messages[8]).toBe('[onMount] sveltePage.props.foo is bar')
  await expect(await page.locator('#input').inputValue()).toEqual('bar')

  consoleMessages.messages = []
  await page.getByRole('link', { name: 'Baz' }).click()

  await expect(page.getByText('foo prop is baz', { exact: true })).toBeVisible()
  await expect(page.getByText('page.props.foo is baz', { exact: true })).toBeVisible()
  await expect(page.getByText('pageProps.foo is baz')).toBeVisible()
  await expect(page.getByText('sveltePage.props.foo is baz')).toBeVisible()
  await expect(consoleMessages.messages).toHaveLength(9)
  await expect(consoleMessages.messages[0]).toBe('[script] foo prop is baz')
  await expect(consoleMessages.messages[1]).toBe('[script] page.props.foo is baz')
  await expect(consoleMessages.messages[2]).toBe('[script] sveltePage.props.foo is baz')
  await expect(consoleMessages.messages[3]).toBe('[reactive expression] foo prop is baz')
  await expect(consoleMessages.messages[4]).toBe('[reactive expression] page.props.foo is baz')
  await expect(consoleMessages.messages[5]).toBe('[reactive expression] sveltePage.props.foo is baz')
  await expect(consoleMessages.messages[6]).toBe('[onMount] foo prop is baz')
  await expect(consoleMessages.messages[7]).toBe('[onMount] page.props.foo is baz')
  await expect(consoleMessages.messages[8]).toBe('[onMount] sveltePage.props.foo is baz')
  await expect(await page.locator('#input').inputValue()).toEqual('baz')

  consoleMessages.messages = []

  await page.getByRole('link', { name: 'Home' }).click()
  await page.waitForURL('/')

  await page.goBack()
  await page.waitForURL('/svelte/props-and-page-store?foo=baz')

  await expect(page.getByText('foo prop is baz', { exact: true })).toBeVisible()
  await expect(page.getByText('page.props.foo is baz', { exact: true })).toBeVisible()
  await expect(page.getByText('pageProps.foo is baz')).toBeVisible()
  await expect(page.getByText('sveltePage.props.foo is baz')).toBeVisible()
  await expect(consoleMessages.messages).toHaveLength(9)
  await expect(consoleMessages.messages[0]).toBe('[script] foo prop is baz')
  await expect(consoleMessages.messages[1]).toBe('[script] page.props.foo is baz')
  await expect(consoleMessages.messages[2]).toBe('[script] sveltePage.props.foo is baz')
  await expect(consoleMessages.messages[3]).toBe('[reactive expression] foo prop is baz')
  await expect(consoleMessages.messages[4]).toBe('[reactive expression] page.props.foo is baz')
  await expect(consoleMessages.messages[5]).toBe('[reactive expression] sveltePage.props.foo is baz')
  await expect(consoleMessages.messages[6]).toBe('[onMount] foo prop is baz')
  await expect(consoleMessages.messages[7]).toBe('[onMount] page.props.foo is baz')
  await expect(consoleMessages.messages[8]).toBe('[onMount] sveltePage.props.foo is baz')
})
