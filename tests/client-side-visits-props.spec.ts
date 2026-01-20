import test, { expect } from '@playwright/test'
import { requests } from './support'

test.describe('Client-side visits with props manipulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client-side-visit/props')
    requests.listen(page)
  })

  test.describe('replaceProp', () => {
    test('replaceProp replaces a string prop', async ({ page }) => {
      await expect(page.getByText('User: John Doe (Age: 30)')).toBeVisible()

      await page.getByRole('button', { name: 'Replace user.name' }).click()
      await expect(page.getByText('User: Jane Smith (Age: 30)')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('replaceProp replaces a number prop', async ({ page }) => {
      await expect(page.getByText('Count: 5')).toBeVisible()

      await page.getByRole('button', { name: 'Replace count', exact: true }).click()
      await expect(page.getByText('Count: 10')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('replaceProp works with functions', async ({ page }) => {
      await expect(page.getByText('Count: 5')).toBeVisible()

      await page.getByRole('button', { name: 'Replace count (function)' }).click()
      await expect(page.getByText('Count: 10')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })
  })

  test.describe('appendToProp', () => {
    test('appendToProp appends single item to array', async ({ page }) => {
      await expect(page.getByText('Items: ["item1","item2"]')).toBeVisible()

      await page.getByRole('button', { name: 'Append to items (single)' }).click()
      await expect(page.getByText('Items: ["item1","item2","item3"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('appendToProp appends multiple items to array', async ({ page }) => {
      await expect(page.getByText('Items: ["item1","item2"]')).toBeVisible()

      await page.getByRole('button', { name: 'Append to items (multiple)' }).click()
      await expect(page.getByText('Items: ["item1","item2",["item4","item5"]]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('appendToProp works with functions', async ({ page }) => {
      await expect(page.getByText('Tags: [{"id":1,"name":"tag1"},{"id":2,"name":"tag2"}]')).toBeVisible()

      await page.getByRole('button', { name: 'Append to tags (function)' }).click()
      await expect(
        page.getByText('Tags: [{"id":1,"name":"tag1"},{"id":2,"name":"tag2"},{"id":3,"name":"tag3"}]'),
      ).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('appendToProp handles array to array', async ({ page }) => {
      await expect(page.getByText('Tags: [{"id":1,"name":"tag1"},{"id":2,"name":"tag2"}]')).toBeVisible()

      await page.getByRole('button', { name: 'Append array to array (objects)' }).click()
      await expect(
        page.getByText(
          'Tags: [{"id":1,"name":"tag1"},{"id":2,"name":"tag2"},[{"id":3,"name":"tag3"},{"id":4,"name":"tag4"}]]',
        ),
      ).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })
  })

  test.describe('prependToProp', () => {
    test('prependToProp prepends single item to array', async ({ page }) => {
      await expect(page.getByText('Items: ["item1","item2"]')).toBeVisible()

      await page.getByRole('button', { name: 'Prepend to items (single)' }).click()
      await expect(page.getByText('Items: ["item0","item1","item2"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('prependToProp prepends multiple items to array', async ({ page }) => {
      await expect(page.getByText('Items: ["item1","item2"]')).toBeVisible()

      await page.getByRole('button', { name: 'Prepend to items (multiple)' }).click()
      await expect(page.getByText('Items: [["itemA","itemB"],"item1","item2"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('prependToProp works with functions', async ({ page }) => {
      await expect(page.getByText('Tags: [{"id":1,"name":"tag1"},{"id":2,"name":"tag2"}]')).toBeVisible()

      await page.getByRole('button', { name: 'Prepend to tags (function)' }).click()
      await expect(
        page.getByText('Tags: [{"id":0,"name":"tag0"},{"id":1,"name":"tag1"},{"id":2,"name":"tag2"}]'),
      ).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })
  })

  test.describe('edge cases', () => {
    test('appendToProp handles single + single values (mergeArrays)', async ({ page }) => {
      await expect(page.getByText('Single Value: "hello"')).toBeVisible()

      await page.getByRole('button', { name: 'Append to non-array (single + single)' }).click()
      await expect(page.getByText('Single Value: ["hello","world"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('prependToProp handles single + single values (mergeArrays)', async ({ page }) => {
      await expect(page.getByText('Single Value: "hello"')).toBeVisible()

      await page.getByRole('button', { name: 'Prepend to non-array (single + single)' }).click()
      await expect(page.getByText('Single Value: ["hey","hello"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('appendToProp handles array to non-array', async ({ page }) => {
      await expect(page.getByText('Single Value: "hello"')).toBeVisible()

      await page.getByRole('button', { name: 'Append array to non-array (single + array)' }).click()
      await expect(page.getByText('Single Value: ["hello",["there","world"]]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('prependToProp handles array to non-array', async ({ page }) => {
      await expect(page.getByText('Single Value: "hello"')).toBeVisible()

      await page.getByRole('button', { name: 'Prepend array to non-array (array + single)' }).click()
      await expect(page.getByText('Single Value: [["hey","hi"],"hello"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('appendToProp handles undefined values', async ({ page }) => {
      await expect(page.locator('text=Undefined Value:')).toBeVisible()

      await page.getByRole('button', { name: 'Append to undefined' }).click()
      await expect(page.getByText('Undefined Value: ["new value"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })

    test('prependToProp handles undefined values', async ({ page }) => {
      await expect(page.locator('text=Undefined Value:')).toBeVisible()

      await page.getByRole('button', { name: 'Prepend to undefined' }).click()
      await expect(page.getByText('Undefined Value: ["start value"]')).toBeVisible()
      expect(requests.requests.length).toBe(0)
    })
  })
})
