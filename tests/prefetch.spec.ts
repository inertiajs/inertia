import { expect, Page, test } from '@playwright/test'
import { isWebKit, requests } from './support'

const isPrefetchPage = async (page: Page, id: number) => {
  await page.waitForURL(`prefetch/${id}`)
  await expect(page.getByText(`This is page ${id}`)).toBeVisible()
}

const isPrefetchSwrPage = async (page: Page, id: number) => {
  await page.waitForURL(`prefetch/swr/${id}`)
  await expect(page.getByText(`This is page ${id}`)).toBeVisible()
}

const hoverAndClick = async (page: Page, buttonText: string, id: number) => {
  const prefetchPromise = page.waitForResponse(`prefetch/swr/${id}`)
  await page.getByRole('link', { name: buttonText, exact: true }).hover()
  await prefetchPromise
  await page.getByRole('link', { name: buttonText, exact: true }).click()
  await isPrefetchSwrPage(page, id)
}

test('will not prefetch current page', async ({ page }) => {
  // These two prefetch requests should be made on mount
  const prefetch2 = page.waitForResponse('prefetch/2')
  const prefetch4 = page.waitForResponse('prefetch/4')

  await page.goto('prefetch/1')

  // These two prefetch requests should be made on mount
  const request2 = await prefetch2
  const request4 = await prefetch4

  expect(request2.request().headers().purpose).toBe('prefetch')
  expect(request4.request().headers().purpose).toBe('prefetch')

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover (Default)' }).hover()
  await page.waitForTimeout(100)
  // This is the page we're already on, so it shouldn't make a request
  await expect(requests.requests.length).toBe(0)
})

test('removes single-use prefetch from cache when cacheFor is 0', async ({ page }) => {
  const prefetch5 = page.waitForResponse('prefetch/5')

  await page.goto('prefetch/1')
  await prefetch5

  requests.listen(page)
  await page.getByRole('link', { name: 'On Mount (Once)' }).click()
  await isPrefetchPage(page, 5)
  await expect(requests.requests.length).toBe(0)

  // Now that we've used it, it should be removed from the cache
  await page.getByRole('link', { name: 'On Mount (Once)' }).click()
  await expect(requests.requests.length).toBe(1)
})

test('can prefetch using link props', async ({ page }) => {
  // These two prefetch requests should be made on mount
  const prefetch2 = page.waitForResponse('prefetch/2')
  const prefetch4 = page.waitForResponse('prefetch/4')

  await page.goto('prefetch/1')

  // These two prefetch requests should be made on mount
  await prefetch2
  await prefetch4

  requests.listen(page)

  await page.getByRole('link', { name: 'On Mount', exact: true }).click()
  await isPrefetchPage(page, 2)
  await expect(requests.requests.length).toBe(0)

  await page.getByRole('link', { name: 'On Hover + Mount' }).click()
  await isPrefetchPage(page, 4)
  await expect(requests.requests.length).toBe(0)

  await page.getByRole('link', { name: 'On Click' }).hover()
  const prefetch3 = page.waitForResponse('prefetch/3')
  await page.mouse.down()
  await prefetch3
  await expect(page).toHaveURL('prefetch/4')
  requests.listen(page)
  await page.mouse.up()
  await isPrefetchPage(page, 3)
  await expect(requests.requests.length).toBe(0)

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover (Default)' }).hover()
  await page.getByRole('link', { name: 'On Click' }).hover()
  // If they just do a quick hover, it shouldn't make the request
  await expect(requests.requests.length).toBe(0)

  const prefetch1 = page.waitForResponse('prefetch/1')
  await page.getByRole('link', { name: 'On Hover (Default)' }).hover()
  await prefetch1
  await expect(page).toHaveURL('prefetch/3')

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover (Default)' }).click()
  await isPrefetchPage(page, 1)
  await expect(requests.requests.length).toBe(0)

  // Wait for the cache to timeout on the combo link
  await page.waitForTimeout(1200)

  const prefetch4b = page.waitForResponse('prefetch/4')
  await page.getByRole('link', { name: 'On Hover + Mount' }).hover()
  await prefetch4b
  await expect(page).toHaveURL('prefetch/1')

  requests.listen(page)
  await page.getByRole('link', { name: 'On Hover + Mount' }).click()
  await isPrefetchPage(page, 4)
  await expect(requests.requests.length).toBe(0)
})

test('can prefetch using link props with keyboard events', async ({ page }) => {
  // These two prefetch requests should be made on mount
  const prefetch2 = page.waitForResponse('prefetch/2')
  const prefetch4 = page.waitForResponse('prefetch/4')

  await page.goto('prefetch/1')

  // These two prefetch requests should be made on mount
  await prefetch2
  await prefetch4

  // Keyboard activation with Enter
  await page.getByRole('link', { name: 'On Enter' }).focus()
  const prefetch6 = page.waitForResponse('prefetch/6')
  await page.keyboard.down('Enter')
  await prefetch6
  await expect(page).toHaveURL('prefetch/1')
  requests.listen(page)
  await page.keyboard.up('Enter')
  await isPrefetchPage(page, 6)
  await expect(requests.requests.length).toBe(0)

  // Keyboard activation with Spacebar on link (nothing happens)
  await page.getByRole('link', { name: 'On Click' }).focus()
  await page.keyboard.down(' ')
  await expect(page).toHaveURL('prefetch/6')
  requests.listen(page)
  await page.keyboard.up(' ')
  await expect(requests.requests.length).toBe(0)

  // Keyboard activation with Spacebar on button
  await page.getByRole('button', { name: 'On Spacebar' }).focus()
  const prefetch7 = page.waitForResponse('prefetch/7')
  await page.keyboard.down(' ')
  await prefetch7
  await expect(page).toHaveURL('prefetch/6')
  requests.listen(page)
  await page.keyboard.up(' ')
  await isPrefetchPage(page, 7)
  await expect(requests.requests.length).toBe(0)

  // Keyboard activation with Enter on button
  await page.goto('prefetch/1')
  await page.getByRole('button', { name: 'On Spacebar' }).focus()
  const prefetch7b = page.waitForResponse('prefetch/7')
  await page.keyboard.down('Enter')
  await prefetch7b
  await expect(page).toHaveURL('prefetch/1')
  requests.listen(page)
  await page.keyboard.up('Enter')
  await isPrefetchPage(page, 7)
  await expect(requests.requests.length).toBe(0)
})

test('does not navigate or prefetch on secondary button click when using prefetch="click"', async ({ page }) => {
  // Skip on WebKit
  if (isWebKit(page)) {
    return test.skip('Bug in Playwright + WebKit causing the context menu to stick around')
  }

  // These two prefetch requests should be made on mount
  const prefetch2 = page.waitForResponse('prefetch/2')
  const prefetch4 = page.waitForResponse('prefetch/4')

  await page.goto('prefetch/1')

  await prefetch2
  await prefetch4

  const link = page.getByRole('link', { name: 'On Click', exact: true })
  await expect(link).toBeVisible()

  requests.listen(page)

  // Right-click (secondary button) should not trigger navigation or prefetch
  await link.click({ button: 'right' })
  await page.waitForTimeout(100)
  await expect(requests.requests.length).toBe(0)
  await expect(page).toHaveURL('prefetch/1')

  // Middle-click should also not trigger navigation or prefetch
  await link.click({ button: 'middle' })
  await page.waitForTimeout(100)
  await expect(requests.requests.length).toBe(0)
  await expect(page).toHaveURL('prefetch/1')

  // Left-click should work normally (mousedown prefetches, mouseup navigates)
  await link.hover()
  const prefetch3b = page.waitForResponse('prefetch/3')
  await page.mouse.down()
  await prefetch3b
  await expect(page).toHaveURL('prefetch/1')
  requests.listen(page)
  await page.mouse.up()
  await isPrefetchPage(page, 3)
  await expect(requests.requests.length).toBe(0)
})

test('can cache links with single cache value', async ({ page }) => {
  await page.goto('prefetch/swr/1')

  requests.listen(page)

  // Click back and forth a couple of times to ensure no requests go out
  await hoverAndClick(page, '1s Expired (Number)', 3)
  await expect(requests.requests.length).toBe(1)
  const lastLoaded1 = await page.locator('#last-loaded').textContent()

  await hoverAndClick(page, '1s Expired', 2)
  await isPrefetchSwrPage(page, 2)
  await expect(requests.requests.length).toBe(2)
  const lastLoaded2 = await page.locator('#last-loaded').textContent()

  requests.listen(page)

  await page.getByRole('link', { exact: true, name: '1s Expired (Number)' }).click()
  await isPrefetchSwrPage(page, 3)
  await expect(requests.requests.length).toBe(0)
  const lastLoaded1New = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded1).toBe(lastLoaded1New)

  await page.getByRole('link', { exact: true, name: '1s Expired' }).click()
  await isPrefetchSwrPage(page, 2)
  await expect(requests.requests.length).toBe(0)
  const lastLoaded2New = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded2).toBe(lastLoaded2New)

  // Wait for cache to expire
  await page.waitForTimeout(1200)

  requests.listenForFinished(page)

  await hoverAndClick(page, '1s Expired (Number)', 3)
  await expect(requests.finished.length).toBe(1)
  const lastLoaded1Fresh = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded1).not.toBe(lastLoaded1Fresh)

  await hoverAndClick(page, '1s Expired', 2)
  await expect(requests.finished.length).toBe(2)
  const lastLoaded2Fresh = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded2).not.toBe(lastLoaded2Fresh)
})

test.describe('UrlMethodPair prefetch support', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cache before each test
    await page.goto('prefetch/wayfinder')
    await page.locator('#flush-all').click()
    await page.waitForTimeout(100)

    // Verify the cache is actually cleared
    await expect(page.locator('#is-prefetched')).toHaveText('false')
    await expect(page.locator('#is-prefetching')).toHaveText('false')
  })

  test('can prefetch with UrlMethodPair', async ({ page }) => {
    await expect(page.locator('#is-prefetched')).toHaveText('false')
    await expect(page.locator('#is-prefetching')).toHaveText('false')

    const prefetchPromise = page.waitForResponse((response) => response.url().includes('prefetch/swr/4'))
    await page.locator('#test-prefetch').click()

    await expect(page.locator('#is-prefetching')).toHaveText('true')
    await expect(page.locator('#is-prefetched')).toHaveText('false')

    await prefetchPromise

    await expect(page.locator('#is-prefetched')).toHaveText('true')
    await expect(page.locator('#is-prefetching')).toHaveText('false')
  })

  test('can use flush with UrlMethodPair', async ({ page }) => {
    const swrResponse = page.waitForResponse((response) => response.url().includes('prefetch/swr/4'))
    await page.locator('#test-prefetch').click()
    await swrResponse

    await expect(page.locator('#is-prefetched')).toHaveText('true')

    await page.locator('#test-flush').click()
    await expect(page.locator('#is-prefetched')).toHaveText('false')
  })
})

test('can visit the page when prefetching has failed due to network error', async ({ page, browser }) => {
  await page.goto('prefetch/after-error')

  page.context().setOffline(true)
  await page.getByRole('button', { name: 'Prefetch Page' }).click()

  page.context().setOffline(false)

  requests.listen(page)
  await page.getByRole('button', { name: 'Visit Page' }).click()

  await isPrefetchSwrPage(page, 1)
})

const submitButtonTexts = ['Submit to Same URL', 'Submit to Other URL']

submitButtonTexts.forEach((buttonText) => {
  test.describe('prefetch cache is invalidated after form submission redirect', () => {
    test(buttonText, async ({ page }) => {
      await page.goto('prefetch/test-page')

      const prefetchPromise = page.waitForResponse('/prefetch/form')
      await page.getByRole('link', { name: 'Go to Prefetch Form' }).hover()
      await prefetchPromise

      requests.listen(page)
      await page.getByRole('link', { name: 'Go to Prefetch Form' }).click()
      await page.waitForURL('/prefetch/form')
      await expect(requests.requests.length).toBe(0)

      const firstRandomValue = await page.locator('.random-value').textContent()
      expect(firstRandomValue).toBeTruthy()

      await page.getByRole('button', { name: buttonText }).click()
      await page.waitForURL('/prefetch/form')

      await page.waitForTimeout(100)
      const secondRandomValue = await page.locator('.random-value').textContent()
      expect(secondRandomValue).not.toBe(firstRandomValue)

      await page.getByRole('link', { name: 'Back to Test Page' }).click()
      await page.waitForURL('/prefetch/test-page')

      requests.listen(page)
      await page.getByRole('link', { name: 'Go to Prefetch Form' }).click()
      await page.waitForURL('/prefetch/form')

      const thirdRandomValue = await page.locator('.random-value').textContent()
      expect(thirdRandomValue).not.toBe(firstRandomValue)
    })
  })
})

test.skip('can do SWR when the link cacheFor prop has two values', async ({ page }) => {
  await page.goto('prefetch/swr/1')

  requests.listen(page)

  await hoverAndClick(page, '1s Stale, 2s Expired (Number)', 5)
  await expect(requests.requests.length).toBe(1)
  const lastLoaded1 = await page.locator('#last-loaded').textContent()

  await hoverAndClick(page, '1s Stale, 2s Expired', 4)
  await expect(requests.requests.length).toBe(2)
  const lastLoaded2 = await page.locator('#last-loaded').textContent()

  requests.listen(page)

  // Click back and forth a couple of times to ensure no requests go out
  await page.getByRole('link', { exact: true, name: '1s Stale, 2s Expired (Number)' }).click()
  await isPrefetchSwrPage(page, 5)
  await expect(requests.requests.length).toBe(0)
  const lastLoaded1New = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded1).toBe(lastLoaded1New)

  await page.getByRole('link', { exact: true, name: '1s Stale, 2s Expired' }).click()
  await isPrefetchSwrPage(page, 4)
  await expect(requests.requests.length).toBe(0)
  const lastLoaded2New = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded2).toBe(lastLoaded2New)

  // Wait for stale time to pass
  await page.waitForTimeout(1200)

  requests.listenForFinished(page)

  const promiseFor5 = page.waitForResponse('prefetch/swr/5')
  await page.getByRole('link', { exact: true, name: '1s Stale, 2s Expired (Number)' }).hover()
  await page.waitForTimeout(75)
  await page.getByRole('link', { exact: true, name: '1s Stale, 2s Expired (Number)' }).click()
  await isPrefetchSwrPage(page, 5)
  const lastLoaded1Stale = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded1).toBe(lastLoaded1Stale)
  await promiseFor5

  //   await expect(requests.finished.length).toBe(1)
  await page.waitForTimeout(600)
  const lastLoaded1Fresh = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded1).not.toBe(lastLoaded1Fresh)

  const promiseFor4 = page.waitForResponse('prefetch/swr/4')
  await page.getByRole('link', { exact: true, name: '1s Stale, 2s Expired' }).click()
  await isPrefetchSwrPage(page, 4)
  const lastLoaded2Stale = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded2).toBe(lastLoaded2Stale)

  await promiseFor4
  //   await expect(requests.finished.length).toBe(2)
  await page.waitForTimeout(100)
  const lastLoaded2Fresh = await page.locator('#last-loaded').textContent()
  await expect(lastLoaded2).not.toBe(lastLoaded2Fresh)
})

test.describe('tags', () => {
  const isTagsPage = async (page: Page, id: number) => {
    await page.waitForURL(`prefetch/tags/${id}`)
    await expect(page.getByText(`This is tags page ${id}`)).toBeVisible()
  }

  test('can flush prefetch cache by tags', async ({ page }) => {
    await page.goto('prefetch/tags/1')

    const prefetch2 = page.waitForResponse('prefetch/tags/2')
    await page.getByRole('link', { name: 'User Page 2' }).hover()
    await page.waitForTimeout(75)
    await prefetch2

    const prefetch3 = page.waitForResponse('prefetch/tags/3')
    await page.getByRole('link', { name: 'Product Page 3' }).hover()
    await page.waitForTimeout(75)
    await prefetch3

    const prefetch6 = page.waitForResponse('prefetch/tags/6')
    await page.getByRole('link', { name: 'Untagged Page 6' }).hover()
    await page.waitForTimeout(75)
    await prefetch6

    requests.listen(page)
    await page.getByRole('link', { name: 'User Page 2' }).click()
    await isTagsPage(page, 2)
    await expect(requests.requests.length).toBe(0)

    requests.listen(page)
    await page.getByRole('link', { name: 'Product Page 3' }).click()
    await isTagsPage(page, 3)
    await expect(requests.requests.length).toBe(0)

    await page.getByRole('button', { name: 'Flush User Tags' }).click()

    requests.listen(page)
    await page.getByRole('link', { name: 'User Page 2' }).click()
    await isTagsPage(page, 2)
    await expect(requests.requests.length).toBeGreaterThanOrEqual(1)

    requests.listen(page)
    await page.getByRole('link', { name: 'Product Page 3' }).click()
    await isTagsPage(page, 3)
    await expect(requests.requests.length).toBe(0)

    requests.listen(page)
    await page.getByRole('link', { name: 'Untagged Page 6' }).click()
    await isTagsPage(page, 6)
    await expect(requests.requests.length).toBe(0)
  })

  test('can flush multiple tags simultaneously', async ({ page }) => {
    await page.goto('prefetch/tags/1')

    const prefetch2 = page.waitForResponse('prefetch/tags/2')
    await page.getByRole('link', { name: 'User Page 2' }).hover()
    await page.waitForTimeout(75)
    await prefetch2

    const prefetch3 = page.waitForResponse('prefetch/tags/3')
    await page.getByRole('link', { name: 'Product Page 3' }).hover()
    await page.waitForTimeout(75)
    await prefetch3

    const prefetch5 = page.waitForResponse('prefetch/tags/5')
    await page.getByRole('link', { name: 'Admin Page 5' }).hover()
    await page.waitForTimeout(75)
    await prefetch5

    const prefetch6 = page.waitForResponse('prefetch/tags/6')
    await page.getByRole('link', { name: 'Untagged Page 6' }).hover()
    await page.waitForTimeout(75)
    await prefetch6

    requests.listen(page)
    await page.getByRole('link', { name: 'User Page 2' }).click()
    await isTagsPage(page, 2)
    await expect(requests.requests.length).toBe(0)

    requests.listen(page)
    await page.getByRole('link', { name: 'Product Page 3' }).click()
    await isTagsPage(page, 3)
    await expect(requests.requests.length).toBe(0)

    requests.listen(page)
    await page.getByRole('link', { name: 'Admin Page 5' }).click()
    await isTagsPage(page, 5)
    await expect(requests.requests.length).toBe(0)

    requests.listen(page)
    await page.getByRole('link', { name: 'Untagged Page 6' }).click()
    await isTagsPage(page, 6)
    await expect(requests.requests.length).toBe(0)

    await page.getByRole('button', { name: 'Flush User + Product Tags' }).click()

    requests.listen(page)
    await page.getByRole('link', { name: 'User Page 2' }).click()
    await expect(requests.requests.length).toBeGreaterThanOrEqual(1)
    await isTagsPage(page, 2)

    requests.listen(page)
    await page.getByRole('link', { name: 'Product Page 3' }).click()
    await expect(requests.requests.length).toBeGreaterThanOrEqual(1)
    await isTagsPage(page, 3)

    requests.listen(page)
    await page.getByRole('link', { name: 'Admin Page 5' }).click()
    await isTagsPage(page, 5)
    await expect(requests.requests.length).toBe(0)

    requests.listen(page)
    await page.getByRole('link', { name: 'Untagged Page 6' }).click()
    await isTagsPage(page, 6)
    await expect(requests.requests.length).toBe(0)
  })

  const cacheTagPropTypes = ['string', 'array']

  cacheTagPropTypes.forEach((propType) => {
    test.describe(`(using ${propType})`, () => {
      test('can use programmatic router.prefetch with tags', async ({ page }) => {
        await page.goto(`prefetch/tags/1/${propType}`)

        const prefetch2 = page.waitForResponse('/prefetch/tags/2')
        const prefetch3 = page.waitForResponse('/prefetch/tags/3')
        const prefetch6 = page.waitForResponse('/prefetch/tags/6')

        await page.getByRole('button', { name: 'Programmatic Prefetch' }).click()

        await prefetch2
        await prefetch3
        await prefetch6

        requests.listen(page)
        await page.getByRole('link', { name: 'User Page 2' }).click()
        await isTagsPage(page, 2)
        await expect(requests.requests.length).toBe(0)

        requests.listen(page)
        await page.getByRole('link', { name: 'Product Page 3' }).click()
        await isTagsPage(page, 3)
        await expect(requests.requests.length).toBe(0)

        requests.listen(page)
        await page.getByRole('link', { name: 'Untagged Page 6' }).click()
        await isTagsPage(page, 6)
        await expect(requests.requests.length).toBe(0)

        await page.getByRole('button', { name: 'Flush User Tags' }).click()

        requests.listen(page)
        await page.getByRole('link', { name: 'User Page 2' }).click()
        await isTagsPage(page, 2)
        await expect(requests.requests.length).toBeGreaterThanOrEqual(1)

        requests.listen(page)
        await page.getByRole('link', { name: 'Product Page 3' }).click()
        await isTagsPage(page, 3)
        await expect(requests.requests.length).toBe(0)

        requests.listen(page)
        await page.getByRole('link', { name: 'Untagged Page 6' }).click()
        await isTagsPage(page, 6)
        await expect(requests.requests.length).toBe(0)
      })

      test('can use useForm with invalidate option', async ({ page }) => {
        await page.goto(`prefetch/tags/1/${propType}`)

        const prefetchUser = page.waitForResponse('/prefetch/tags/2')
        await page.getByRole('link', { name: 'User Page 2' }).hover()
        await page.waitForTimeout(100)
        await prefetchUser

        const prefetchProduct = page.waitForResponse('/prefetch/tags/3')
        await page.getByRole('link', { name: 'Product Page 3' }).hover()
        await page.waitForTimeout(100)
        await prefetchProduct

        const prefetchUntagged = page.waitForResponse('/prefetch/tags/6')
        await page.getByRole('link', { name: 'Untagged Page 6' }).hover()
        await page.waitForTimeout(100)
        await prefetchUntagged

        await page.fill('#form-name', 'Test User')
        await page.click('#submit-invalidate-user')

        await page.waitForURL('/dump/post')

        await page.goBack()

        requests.listen(page)
        await page.getByRole('link', { name: 'User Page 2' }).click()
        await isTagsPage(page, 2)
        await expect(requests.requests.length).toBeGreaterThanOrEqual(1)

        await page.goBack()

        requests.listen(page)
        await page.getByRole('link', { name: 'Product Page 3' }).click()
        await isTagsPage(page, 3)
        await expect(requests.requests.length).toBe(0)

        await page.goBack()

        requests.listen(page)
        await page.getByRole('link', { name: 'Untagged Page 6' }).click()
        await isTagsPage(page, 6)
        await expect(requests.requests.length).toBe(0)
      })
    })
  })
})

test('can use prefetched requests with preserveState', async ({ page }) => {
  await page.goto('/prefetch/preserve-state')

  const prefetchResponse = page.waitForResponse('prefetch/preserve-state?page=2')
  await page.getByRole('button', { name: 'Prefetch Page 2' }).click()
  await prefetchResponse

  requests.listen(page)

  // Test both preserveState options use cache
  await page.getByRole('button', { name: 'Load Page 2 (preserveState: false)' }).click()
  await expect(page.getByText('Current Page: 2')).toBeVisible()
  await expect(requests.requests.length).toBe(0)

  await page.goto('/prefetch/preserve-state')

  const prefetchResponse2 = page.waitForResponse('prefetch/preserve-state?page=2')
  await page.getByRole('button', { name: 'Prefetch Page 2' }).click()
  await prefetchResponse2

  requests.listen(page)

  await page.getByRole('button', { name: 'Load Page 2 (preserveState: true)' }).click()
  await expect(page.getByText('Current Page: 2')).toBeVisible()
  await expect(requests.requests.length).toBe(0)
})
