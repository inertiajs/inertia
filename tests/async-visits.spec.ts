import { expect, test } from '@playwright/test'

test.describe('Async visits', () => {
  test('it does not cancel repeated async visits to a different page', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/async-visits/page-b')) {
        cancelled.push(req.failure()?.errorText || 'failed')
      }
    })

    await page.goto('/async-visits/page-a')
    await expect(page.getByText('Page: A')).toBeVisible()

    const link = page.getByRole('link', { name: 'Go to B async' })

    const inFlight = page.waitForRequest('**/async-visits/page-b')
    await link.click()
    await inFlight

    await link.click()
    await link.click()

    await expect(page.getByText('Page: B')).toBeVisible()
    expect(cancelled).toHaveLength(0)
  })

  test('it does not cancel an in-flight async visit when navigating to a different page', async ({ page }) => {
    const cancelled: string[] = []
    const completed: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/async-visits/page-b')) {
        cancelled.push(req.failure()?.errorText || 'failed')
      }
    })

    page.on('response', (res) => {
      if (res.url().includes('/async-visits/page-b') && res.status() === 200) {
        completed.push(res.url())
      }
    })

    await page.goto('/async-visits/page-a')
    await expect(page.getByText('Page: A')).toBeVisible()

    const inFlight = page.waitForRequest('**/async-visits/page-b')
    await page.getByRole('link', { name: 'Go to B async' }).click()
    await inFlight

    await page.getByRole('link', { name: 'Go to C' }).click()
    await expect(page.getByText('Page: C')).toBeVisible()

    await expect.poll(() => completed.length).toBe(1)
    expect(cancelled).toHaveLength(0)
  })

  test('it cancels an in-flight reload of the current page when navigating away', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/async-visits/reload-origin') && req.headers()['x-repro-delay']) {
        cancelled.push(req.failure()?.errorText || 'failed')
      }
    })

    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    const inFlight = page.waitForRequest(
      (req) => req.url().includes('/async-visits/reload-origin') && !!req.headers()['x-repro-delay'],
    )
    await page.getByRole('button', { name: 'Reload', exact: true }).click()
    await inFlight

    await page.getByRole('link', { name: 'Go to C' }).click()
    await expect(page.getByText('Page: C')).toBeVisible()

    await expect.poll(() => cancelled.length).toBe(1)
  })

  test('it cancels a reload that starts while a visit to another query string is in flight', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/async-visits/reload-origin') && req.headers()['x-repro-delay']) {
        cancelled.push(req.failure()?.errorText || 'failed')
      }
    })

    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Visit page 2 and reload' }).click()

    await expect(page.getByText('Reload: cancelled')).toBeVisible()
    await expect(page).toHaveURL('/async-visits/reload-origin?page=2')
    await expect.poll(() => cancelled.length).toBe(1)
  })

  test('it does not cancel a reload of the current page when an async visit to another URL starts', async ({
    page,
  }) => {
    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Reload and post async' }).click()

    await expect(page.getByText('Reload: finished')).toBeVisible()
    await expect(page).toHaveURL('/async-visits/reload-origin')
  })

  test('it does not cancel a reload of the current page when a visit is redirected back to it', async ({ page }) => {
    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Visit redirect and reload' }).click()

    await expect(page.getByText('Reload: finished')).toBeVisible()
    await expect(page).toHaveURL('/async-visits/reload-origin')
  })

  test('it does not cancel a reload of the current page when a post redirects back to it', async ({ page }) => {
    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Post and reload' }).click()

    await expect(page.getByText('Reload: finished')).toBeVisible()
    await expect(page).toHaveURL('/async-visits/reload-origin')
  })

  test('it cancels a reload of the current page when a post to it redirects to another page', async ({ page }) => {
    const cancelled: string[] = []

    page.on('requestfailed', (req) => {
      if (req.url().includes('/async-visits/reload-origin') && req.headers()['x-repro-delay']) {
        cancelled.push(req.failure()?.errorText || 'failed')
      }
    })

    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Post to this page and reload' }).click()

    await expect(page.getByText('Page: C')).toBeVisible()
    await expect.poll(() => cancelled.length).toBe(1)
  })

  test('it keeps the query string of a client visit when a reload that started before it lands', async ({ page }) => {
    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Reload and replace query' }).click()
    await expect(page).toHaveURL('/async-visits/reload-origin?page=2')

    await expect(page.getByText('Reload: finished')).toBeVisible()
    await expect(page).toHaveURL('/async-visits/reload-origin?page=2')
  })

  test('it lets an async visit to another query string set its URL after a client visit changed it', async ({
    page,
  }) => {
    await page.goto('/async-visits/reload-origin')
    await expect(page.getByText('Page: Reload Origin')).toBeVisible()

    await page.getByRole('button', { name: 'Visit page 3 async and replace query' }).click()
    await expect(page).toHaveURL('/async-visits/reload-origin?page=2')

    await expect(page).toHaveURL('/async-visits/reload-origin?page=3')
  })
})
