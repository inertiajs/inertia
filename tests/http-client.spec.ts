import { expect, Page, test } from '@playwright/test'
import { pageLoads } from './support'

const getRawBodyResponse = async (page: Page): Promise<any> => {
  await page.waitForFunction(() => (window as any)._raw_body_response)

  return page.evaluate(() => (window as any)._raw_body_response)
}

test.describe('HTTP client', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/visits/data/raw-body')
  })

  test('sends URLSearchParams without JSON serialization', async ({ page }) => {
    await page.getByRole('link', { name: 'URLSearchParams Link' }).click()

    const response = await getRawBodyResponse(page)

    expect(response.method).toBe('post')
    expect(response.form).toEqual({ foo: 'bar' })
    expect(response.headers['content-type']).toContain('application/x-www-form-urlencoded')
  })

  test('sends a string without JSON serialization', async ({ page }) => {
    await page.getByRole('link', { name: 'String Link' }).click()

    const response = await getRawBodyResponse(page)

    expect(response.method).toBe('post')
    expect(response.body).toBe('raw string contents')
    expect(response.form).toEqual({})
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.headers['content-length']).toBe('19')
  })

  test('sends a Blob without JSON serialization', async ({ page }) => {
    await page.getByRole('link', { name: 'Blob Link' }).click()

    const response = await getRawBodyResponse(page)

    expect(response.method).toBe('post')
    expect(response.body).toBe('raw blob contents')
    expect(response.form).toEqual({})
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.headers['content-length']).toBe('17')
  })

  test('sends an ArrayBuffer without JSON serialization', async ({ page }) => {
    await page.getByRole('link', { name: 'ArrayBuffer Link' }).click()

    const response = await getRawBodyResponse(page)

    expect(response.method).toBe('post')
    expect(response.body).toBe('raw array buffer contents')
    expect(response.form).toEqual({})
    expect(response.headers['content-type']).toBeUndefined()
    expect(response.headers['content-length']).toBe('25')
  })

  test('sends an ArrayBufferView without JSON serialization', async ({ page }) => {
    await page.getByRole('link', { name: 'ArrayBufferView Link' }).click()

    const response = await getRawBodyResponse(page)

    expect(response.method).toBe('post')
    expect(response.body).toBe('raw array buffer view contents')
    expect(response.form).toEqual({})
    expect(response.headers['content-type']).toBeUndefined()
    expect(response.headers['content-length']).toBe('30')
  })
})
