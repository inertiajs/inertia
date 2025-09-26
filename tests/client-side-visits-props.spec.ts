import test, { expect } from '@playwright/test'
import { requests } from './support'

test.describe('Client-side visits with props manipulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client-side-visit/props')
  })

  test('replaceProp replaces a string prop', async ({ page }) => {
    await expect(page.getByText('User: John Doe (Age: 30)')).toBeVisible()

    await page.getByRole('button', { name: 'Replace user.name' }).click()
    await expect(page.getByText('User: Jane Smith (Age: 30)')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('replaceProp replaces a number prop', async ({ page }) => {
    await expect(page.getByText('Count: 5')).toBeVisible()

    await page.getByRole('button', { name: 'Replace count', exact: true }).click()
    await expect(page.getByText('Count: 10')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('replaceProp works with functions', async ({ page }) => {
    await expect(page.getByText('Count: 5')).toBeVisible()

    await page.getByRole('button', { name: 'Replace count (function)' }).click()
    await expect(page.getByText('Count: 10')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('appendToProp appends a single item to array', async ({ page }) => {
    await expect(page.getByText('Items: item1, item2')).toBeVisible()

    await page.getByRole('button', { name: 'Append to items (single)' }).click()
    await expect(page.getByText('Items: item1, item2, item3')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('appendToProp appends multiple items to array', async ({ page }) => {
    await expect(page.getByText('Items: item1, item2')).toBeVisible()

    await page.getByRole('button', { name: 'Append to items (multiple)' }).click()
    await expect(page.getByText('Items: item1, item2, item4, item5')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('appendToProp works with functions', async ({ page }) => {
    await expect(page.getByText('Tags: tag1, tag2')).toBeVisible()

    await page.getByRole('button', { name: 'Append to tags (function)' }).click()
    await expect(page.getByText('Tags: tag1, tag2, tag3')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('prependToProp prepends a single item to array', async ({ page }) => {
    await expect(page.getByText('Items: item1, item2')).toBeVisible()

    await page.getByRole('button', { name: 'Prepend to items (single)' }).click()
    await expect(page.getByText('Items: item0, item1, item2')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('prependToProp prepends multiple items to array', async ({ page }) => {
    await expect(page.getByText('Items: item1, item2')).toBeVisible()

    await page.getByRole('button', { name: 'Prepend to items (multiple)' }).click()
    await expect(page.getByText('Items: itemA, itemB, item1, item2')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('prependToProp works with functions', async ({ page }) => {
    await expect(page.getByText('Tags: tag1, tag2')).toBeVisible()

    await page.getByRole('button', { name: 'Prepend to tags (function)' }).click()
    await expect(page.getByText('Tags: tag0, tag1, tag2')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('mergeArrays behavior with various input types', async ({ page }) => {
    // Test sequence: append single, then multiple, then prepend
    await expect(page.getByText('Items: item1, item2')).toBeVisible()

    // Append single
    await page.getByRole('button', { name: 'Append to items (single)' }).click()
    await expect(page.getByText('Items: item1, item2, item3')).toBeVisible()

    // Append multiple
    await page.getByRole('button', { name: 'Append to items (multiple)' }).click()
    await expect(page.getByText('Items: item1, item2, item3, item4, item5')).toBeVisible()

    // Prepend single
    await page.getByRole('button', { name: 'Prepend to items (single)' }).click()
    await expect(page.getByText('Items: item0, item1, item2, item3, item4, item5')).toBeVisible()

    await expect(requests.requests.length).toBe(0)
  })

  test('appendToProp handles non-array values (single + single)', async ({ page }) => {
    await expect(page.getByText('Single Value: hello')).toBeVisible()

    await page.getByRole('button', { name: 'Append to non-array (single + single)' }).click()
    await expect(page.getByText('Single Value: hello, world')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('prependToProp handles non-array values (single + single)', async ({ page }) => {
    await expect(page.getByText('Single Value: hello')).toBeVisible()

    await page.getByRole('button', { name: 'Prepend to non-array (single + single)' }).click()
    await expect(page.getByText('Single Value: hey, hello')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('appendToProp handles array to non-array (single + array)', async ({ page }) => {
    await expect(page.getByText('Single Value: hello')).toBeVisible()

    await page.getByRole('button', { name: 'Append array to non-array (single + array)' }).click()
    await expect(page.getByText('Single Value: hello, there, world')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('prependToProp handles array to non-array (array + single)', async ({ page }) => {
    await expect(page.getByText('Single Value: hello')).toBeVisible()

    await page.getByRole('button', { name: 'Prepend array to non-array (array + single)' }).click()
    await expect(page.getByText('Single Value: hey, hi, hello')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('appendToProp handles undefined value', async ({ page }) => {
    await expect(page.getByText('Undefined Value: undefined')).toBeVisible()

    await page.getByRole('button', { name: 'Append to undefined' }).click()
    await expect(page.getByText('Undefined Value: new value')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })

  test('prependToProp handles undefined value', async ({ page }) => {
    await expect(page.getByText('Undefined Value: undefined')).toBeVisible()

    await page.getByRole('button', { name: 'Prepend to undefined' }).click()
    await expect(page.getByText('Undefined Value: start value')).toBeVisible()
    await expect(requests.requests.length).toBe(0)
  })
})
