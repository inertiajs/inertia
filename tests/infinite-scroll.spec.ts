import { expect, Locator, Page, test } from '@playwright/test'
import { consoleMessages, requests } from './support'

function infiniteScrollRequests() {
  return requests.requests.filter((req) => {
    return (
      req.url().includes('/infinite-scroll/') &&
      !!req.headers()['x-inertia'] &&
      !!req.headers()['x-inertia-partial-data']
    )
  })
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => page.evaluate(() => window.scrollY === 0)).toBe(true)
}

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
}

async function smoothScrollTo(page: any, targetY: number) {
  // The { behavior: 'smooth' } option has different implementation across browsers, so we do our
  // own 'smooth' scroll by scrolling halfway first, then to the target after a short delay...
  await page.evaluate((top: number) => {
    const current = window.scrollY
    window.scrollTo(0, current + (top - current) / 2)
    setTimeout(() => window.scrollTo(0, top), 10)
  }, targetY)

  // Wait for scroll to reach target (clamped to max scrollable position)
  await expect
    .poll(() =>
      page.evaluate((target: number) => {
        const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight
        return Math.abs(window.scrollY - Math.min(target, maxScroll)) < 5
      }, targetY),
    )
    .toBe(true)
}

async function scrollElementSmoothTo(element: Locator, targetY: number) {
  // Same as smoothScrollTo but for a specific element
  await element.evaluate((el, top) => {
    const current = el.scrollTop
    el.scrollTo(0, current + (top - current) / 2)
    setTimeout(() => el.scrollTo(0, top), 10)
  }, targetY)

  await element.page().waitForTimeout(20)
}

async function scrollElementToBottom(element: Locator) {
  const height = await element.evaluate((el) => el.scrollHeight)

  return scrollElementSmoothTo(element, height)
}

async function getUserIdsFromDOM(page: Page) {
  const userCards = await page.locator('[data-user-id]').all()
  const userIds = []

  for (const card of userCards) {
    const userId = await card.getAttribute('data-user-id')
    userIds.push(parseInt(userId || '0'))
  }

  return userIds
}

// Helper function to check URL updates
async function expectQueryString(page: Page, expectedPage: string) {
  if (expectedPage === '1') {
    // Page 1 removes the page param entirely
    await page.waitForFunction(() => !window.location.search.includes('page='), {}, { timeout: 1000 })
    const currentUrl = await page.url()
    expect(currentUrl).not.toContain('page=')
  } else {
    // Other pages should have explicit page param
    await page.waitForFunction((pageNum: string) => window.location.search.includes(`page=${pageNum}`), expectedPage, {
      timeout: 1000,
    })
    const currentUrl = await page.url()
    expect(currentUrl).toContain(`page=${expectedPage}`)
  }
}

async function getUserCardPosition(page: Page, id: string) {
  const userCard = page.getByText(`User ${id}`)
  await expect(userCard).toBeVisible()

  const boundingBox = await userCard.boundingBox()

  if (!boundingBox) {
    throw new Error(`Could not find bounding box for User ${id}`)
  }

  const scrollY = await page.evaluate(() => window.scrollY)
  const viewportHeight = await page.evaluate(() => window.innerHeight)

  return {
    top: boundingBox.y + scrollY,
    bottom: boundingBox.y + boundingBox.height + scrollY,
    viewportTop: boundingBox.y,
    viewportBottom: boundingBox.y + boundingBox.height,
    relativeToViewport: boundingBox.y / viewportHeight,
  }
}

async function getUserCardPositionInContainer(page: Page, container: Locator, id: string) {
  const userCard = page.getByText(`User ${id}`)
  await expect(userCard).toBeVisible()

  const containerBox = await container.boundingBox()
  const userBox = await userCard.boundingBox()

  if (!containerBox || !userBox) {
    throw new Error(`Could not find bounding box for container or User ${id}`)
  }

  const containerScrollTop = await container.evaluate((el) => el.scrollTop)
  const containerHeight = await container.evaluate((el) => el.clientHeight)

  const relativeTop = userBox.y - containerBox.y + containerScrollTop
  const relativeBottom = relativeTop + userBox.height

  return {
    top: relativeTop,
    bottom: relativeBottom,
    viewportTop: userBox.y - containerBox.y,
    viewportBottom: userBox.y + userBox.height - containerBox.y,
    relativeToContainer: (userBox.y - containerBox.y) / containerHeight,
  }
}

test.describe('Automatic page loading', () => {
  test('it loads the next page when scrolling to the bottom', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    // Scroll to middle of page to check we're not loading the next page yet
    await page.evaluate((height) => window.scrollTo(0, height / 2), pageHeight)

    await expect(infiniteScrollRequests().length).toBe(0)

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the bottom of the page to trigger loading the next page
    await scrollToBottom(page)

    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    // Scroll to the bottom of the page - should NOT trigger loading since User 40 is the last one
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2) // Should still be 2, no additional request

    // Check if the data-infinite-scroll attribute is set correctly
    const user1 = await page.locator('[data-user-id="1"]')
    const user15 = await page.locator('[data-user-id="15"]')
    const user16 = await page.locator('[data-user-id="16"]')
    const user30 = await page.locator('[data-user-id="30"]')
    const user31 = await page.locator('[data-user-id="31"]')
    const user40 = await page.locator('[data-user-id="40"]')

    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user40).toHaveAttribute('data-infinite-scroll-page', '3')
  })

  test('it loads the previous page when scrolling to the top', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both?page=3')

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('User 30')).toBeHidden()

    // It automatically loads page 2 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the top - 500px to make sure we don't trigger the previous page yet
    await page.evaluate(() => window.scrollTo(0, 500))

    await expect(infiniteScrollRequests().length).toBe(1) // Should still be 1, no additional request
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to the top to trigger loading the first
    await scrollToTop(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
  })

  test('it loads pages in reverse order when reverse mode is enabled', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/reverse')

    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('User 26')).toBeVisible()
    await expect(page.getByText('User 25')).toBeHidden()

    // It automatically loads page 2 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 25')).toBeVisible()
    await expect(page.getByText('User 11')).toBeVisible()
    await expect(page.getByText('User 10')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the top to trigger loading the last page
    await scrollToTop(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 10')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    // Check if the data-infinite-scroll attribute is set correctly
    const user1 = await page.locator('[data-user-id="1"]')
    const user10 = await page.locator('[data-user-id="10"]')
    const user11 = await page.locator('[data-user-id="11"]')
    const user25 = await page.locator('[data-user-id="25"]')
    const user26 = await page.locator('[data-user-id="26"]')
    const user40 = await page.locator('[data-user-id="40"]')

    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user10).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user11).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user25).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user26).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user40).toHaveAttribute('data-infinite-scroll-page', '1')
  })

  test('it loads pages until viewport is filled when individual pages are short', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/short-content') // 5 items per page

    // It loads enough pages to fill the viewport
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 5')).toBeVisible()
    await expect(page.getByText('User 10')).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 20')).toBeVisible()

    await page.waitForTimeout(500)
    await expect(page.getByText('User 25')).not.toBeVisible()
  })

  test('it handles dual scroll containers with separate data props and page query parameters', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/dual-containers')

    // Get both scroll containers
    const container1 = page.locator('[data-testid="scroll-container-1"]')
    const container2 = page.locator('[data-testid="scroll-container-2"]')

    await expect(container1).toBeVisible()
    await expect(container2).toBeVisible()

    // Initially both containers should show their first pages
    await expect(container1.getByText('User 1', { exact: true })).toBeVisible()
    await expect(container1.getByText('User 15')).toBeVisible()
    await expect(container1.getByText('User 16')).toBeHidden()
    await expect(container2.getByText('User 1', { exact: true })).toBeVisible()
    await expect(container2.getByText('User 15')).toBeVisible()
    await expect(container2.getByText('User 16')).toBeHidden()

    // No query parameters should be present initially
    expect(page.url()).not.toContain('users1=')
    expect(page.url()).not.toContain('users2=')

    // Scroll first container to load page 2 of users1
    await scrollElementSmoothTo(container1, 10000)

    await expect(container1.getByText('User 16')).toBeVisible()
    await expect(container1.getByText('User 30')).toBeVisible()
    await expect(container1.getByText('User 31')).toBeHidden()
    await expect(container2.getByText('User 1', { exact: true })).toBeVisible()
    await expect(container2.getByText('User 15')).toBeVisible()
    await expect(container2.getByText('User 16')).toBeHidden()

    // Scroll to bottom of first container to check URL synchronization
    const currentHeightContainer1 = await container1.evaluate((container) => container.scrollHeight)
    await scrollElementSmoothTo(container1, currentHeightContainer1 - 500)
    await page.waitForFunction(
      () => window.location.search.includes('users1=2'),
      {},
      {
        timeout: 1000,
      },
    )

    // expect ?users1=2 in URL, but not users2
    expect(page.url()).toContain('users1=2')
    expect(page.url()).not.toContain('users2=')

    // Scroll second container to load page 2 of users2
    await scrollElementToBottom(container2)

    await expect(container1.getByText('User 16')).toBeVisible()
    await expect(container1.getByText('User 30')).toBeVisible()
    await expect(container1.getByText('User 31')).toBeHidden()
    await expect(container2.getByText('User 16')).toBeVisible()
    await expect(container2.getByText('User 30')).toBeVisible()
    await expect(container2.getByText('User 31')).toBeHidden()

    // Scroll to bottom of second container to check URL synchronization
    const currentHeightContainer2 = await container2.evaluate((container) => container.scrollHeight)
    await scrollElementSmoothTo(container2, currentHeightContainer2 - 500)
    await page.waitForFunction(
      () => window.location.search.includes('users2=2'),
      {},
      {
        timeout: 1000,
      },
    )

    // expect both ?users1=2 and users2=2 in URL
    expect(page.url()).toContain('users1=2')
    expect(page.url()).toContain('users2=2')
  })

  test('it handles dual sibling InfiniteScroll with manual mode and query string updates', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/dual-sibling')

    await expect(page.getByText('User 1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('User 15').first()).toBeVisible()
    await expect(page.getByText('User 1', { exact: true }).last()).toBeVisible()
    await expect(page.getByText('User 15').last()).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    await page.getByRole('button', { name: 'Load More Users 1' }).click()
    await expect(page.getByText('User 16').first()).toBeVisible()
    await expect(page.getByText('User 30').first()).toBeVisible()

    await page.getByRole('button', { name: 'Load More Users 2' }).click()
    await expect(page.getByText('User 16').last()).toBeVisible()
    await expect(page.getByText('User 30').last()).toBeVisible()

    await expect(page.getByText('User 31')).toBeHidden()

    await scrollToBottom(page)
    await page.waitForFunction(
      () => window.location.search.includes('users1=2') && window.location.search.includes('users2=2'),
      {},
      { timeout: 1000 },
    )
    expect(page.url()).toContain('users1=2')
    expect(page.url()).toContain('users2=2')

    await scrollToTop(page)
    await page.waitForFunction(
      () => !window.location.search.includes('users1=') && !window.location.search.includes('users2='),
      {},
      { timeout: 1000 },
    )
    expect(page.url()).not.toContain('users1=')
    expect(page.url()).not.toContain('users2=')
  })
})

test.describe('Manual page loading', () => {
  test('it allows manual loading of next and previous pages when manual mode is enabled', async ({ page }) => {
    await page.goto('/infinite-scroll/manual?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    requests.listen(page)
    await page.getByRole('button', { name: 'Load previous items' }).click()
    await expect(page.getByText('Loading previous items...')).toBeVisible()
    await expect(page.getByText('Loading next items...')).toBeHidden()

    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading previous items...')).toBeHidden()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('Loading next items...')).toBeVisible()
    await expect(page.getByText('Loading previous items...')).toBeHidden()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading next items...')).toBeHidden()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it switches to manual mode after reaching the manualAfter threshold', async ({ page }) => {
    await page.goto('/infinite-scroll/manual-after')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    requests.listen(page)

    // Scroll to the bottom of the page to trigger loading the next page
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to the bottom of the page to trigger loading the next page
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(2)

    // Scroll to the bottom of the page - should NOT trigger loading since we're in manual mode now
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2) // Should still be 2, no additional request

    // Load next items manually
    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 46')).toBeVisible()
    await expect(page.getByText('User 60')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(3)
  })

  test('it resets pagination state after direct URL navigation', async ({ page }) => {
    await page.goto('/infinite-scroll/manual')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()

    await page.goto('/infinite-scroll/manual')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Has more next items: true')).toBeVisible()
  })

  test('it does not skip pages after direct URL navigation', async ({ page }) => {
    await page.goto('/infinite-scroll/manual')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    await page.goto('/infinite-scroll/manual')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
  })

  test('it resets pagination state when navigating to a different page number', async ({ page }) => {
    await page.goto('/infinite-scroll/manual')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()

    await page.goto('/infinite-scroll/manual?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeHidden()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load previous items' }).click()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Has more previous items: false')).toBeVisible()

    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 20')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
  })
})

test.describe('Remember state', () => {
  test('it preserves state and element tags when navigating away and back', async ({ page }) => {
    await page.goto('/infinite-scroll/remember-state')

    // Verify initial state
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    requests.listen(page)

    // Load page 2
    await scrollToBottom(page)
    await expect(page.getByText('Loading...').or(page.getByText('User 16'))).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Load page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...').or(page.getByText('User 31'))).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('User 46')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)

    await page.waitForTimeout(100)

    // Navigate to home page
    await page.getByRole('link', { name: 'Go to Home' }).click()
    await expect(page.getByText('This is the Test App Entrypoint page')).toBeVisible()

    await page.goBack()

    // Verify state is restored - should show all 3 pages of content
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('User 46')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    // Assert the data-infinite-scroll-page attributes are still correct
    const user1 = await page.locator('[data-user-id="1"]')
    const user15 = await page.locator('[data-user-id="15"]')
    const user16 = await page.locator('[data-user-id="16"]')
    const user30 = await page.locator('[data-user-id="30"]')
    const user31 = await page.locator('[data-user-id="31"]')
    const user45 = await page.locator('[data-user-id="45"]')
    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user45).toHaveAttribute('data-infinite-scroll-page', '3')

    // Verify URL synchronization works after restoration
    await scrollToTop(page)
    await expectQueryString(page, '1')

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    await smoothScrollTo(page, pageHeight * 0.9)
    await expectQueryString(page, '3')

    // Test that load more button works for page 4
    requests.requests = [] // Reset request tracking
    await scrollToBottom(page)
    await page.getByRole('button', { name: 'Load next items' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 46')).toBeVisible()
    await expect(page.getByText('User 60')).toBeVisible()
    await expect(page.getByText('Manual mode: true')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)
  })

  test('it resets to page 1 after browser refresh', async ({ page }) => {
    await page.goto('/infinite-scroll/remember-state')

    // Verify initial state
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    requests.listen(page)

    // Load page 2 (auto mode)
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Load page 3 (this is the 2nd request, which triggers manual mode)
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('User 46')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)

    // Verify we can see all content (pages 1-3)
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()

    // Scroll to top to make page 1 visible and clear the page parameter
    await scrollToTop(page)
    await expectQueryString(page, '1') // This waits for the URL to clear

    // Refresh the browser
    await page.reload()

    // Verify we're back to page 1 with only initial 15 items
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('User 30')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('User 45')).toBeHidden()

    // Verify we're back to initial state (not manual mode)
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    // Verify no page param in URL
    expect(page.url()).not.toContain('page=')
  })

  test('it preserves prepended items when navigating away and back', async ({ page }) => {
    await page.goto('/infinite-scroll/remember-state')

    // Page 1 should be loaded
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    requests.listen(page)

    // Scroll to bottom to load page 2
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(1)

    scrollToTop(page)

    // Prepend two users: User 0 and User -1
    await page.getByRole('button', { name: "Prepend User '0'" }).click()
    await page.getByRole('button', { name: "Prepend User '-1'" }).click()

    // Verify prepended users are visible
    await expect(page.getByText('User 0')).toBeVisible()
    await expect(page.getByText('User -1')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()

    await page.waitForTimeout(250)

    // Navigate to home page
    await page.getByRole('link', { name: 'Go Home' }).click()
    await expect(page.getByText('This is the Test App Entrypoint page')).toBeVisible()

    // Navigate back
    await page.goBack()

    // Verify the users we prepended are still there along with pages 1 and 2 content
    await expect(page.getByText('User -1')).toBeVisible()
    await expect(page.getByText('User 0')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()

    // Verify the dataset attributes are correctly assigned
    // Users -1 and 0 should be part of page 1
    const userMinus1 = await page.locator('[data-user-id="-1"]')
    const user0 = await page.locator('[data-user-id="0"]')
    const user1 = await page.locator('[data-user-id="1"]')
    const user15 = await page.locator('[data-user-id="15"]')
    const user16 = await page.locator('[data-user-id="16"]')
    const user30 = await page.locator('[data-user-id="30"]')

    await expect(userMinus1).toHaveAttribute('data-infinite-scroll-ignore', 'true')
    await expect(userMinus1).not.toHaveAttribute('data-infinite-scroll-page')
    await expect(user0).toHaveAttribute('data-infinite-scroll-ignore', 'true')
    await expect(user0).not.toHaveAttribute('data-infinite-scroll-page')

    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')

    // Scroll to bottom to load page 3
    requests.requests = [] // Reset request tracking
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Verify page 3 loaded correctly
    const user31 = await page.locator('[data-user-id="31"]')
    const user45 = await page.locator('[data-user-id="45"]')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user45).toHaveAttribute('data-infinite-scroll-page', '3')

    await scrollToBottom(page)
    await expectQueryString(page, '3')
  })

  test('it handles starting on page 2, loading pages, refresh, and dataset verification', async ({ page }) => {
    await page.goto('/infinite-scroll/remember-state?page=2')

    requests.listen(page)

    // Should see page 1 content first, then load page 2
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Manual mode: false')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to bottom to load page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('User 46')).toBeHidden()
    await expect(page.getByText('Manual mode: true')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)

    // Scroll to middle to trigger page 2 URL
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    await smoothScrollTo(page, pageHeight * 0.5)
    await expectQueryString(page, '2')

    await page.reload()

    // After refresh on ?page=2, loads page 2 content AND loads page 3 automatically (because of scroll position)
    await expect(page.getByText('User 1', { exact: true })).toBeHidden()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 45')).toBeVisible()
    await expect(page.getByText('Manual mode: false')).toBeVisible()
    expect(page.url()).toContain('page=2')

    // Verify dataset tags for existing elements (pages 2+3 are present)
    const user16 = await page.locator('[data-user-id="16"]')
    const user30 = await page.locator('[data-user-id="30"]')
    const user31 = await page.locator('[data-user-id="31"]')
    const user45 = await page.locator('[data-user-id="45"]')

    // Check that restored elements have correct page tags
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user45).toHaveAttribute('data-infinite-scroll-page', '3')

    // scroll to top, load page 1
    await scrollToTop(page)
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Manual mode: true')).toBeVisible() // two requests have been made

    const user1 = await page.locator('[data-user-id="1"]')
    const user15 = await page.locator('[data-user-id="15"]')

    await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
  })
})

test.describe('Toggle configuration', () => {
  test('it toggles between automatic and manual loading when manual prop changes', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/toggles')

    // Initially manual is false, should auto-load pages
    await expect(page.getByText('Manual mode: false')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Total items on page: 15')).toBeVisible()

    await scrollToBottom(page)

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Enable manual mode
    await page.getByLabel('Manual mode: false').check()
    await expect(page.getByText('Manual mode: true')).toBeVisible()

    // Scroll to bottom again - should NOT auto-load page 3 in manual mode
    await scrollToBottom(page)
    await page.waitForTimeout(500)

    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to top, disable manual mode again
    await scrollToTop(page)
    await page.getByLabel('Manual mode: true').uncheck()
    await expect(page.getByText('Manual mode: false')).toBeVisible()

    // Scroll to bottom - should auto-load page 3 now
    await scrollToBottom(page)

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it toggles between different trigger directions when trigger prop changes', async ({ page }) => {
    requests.listen(page)

    // Start on page 2 with triggerMode='onlyNext' (default), change to triggerMode='onlyPrevious' to auto-load page 1
    await page.goto('/infinite-scroll/toggles?page=2')

    await expect(page.getByText('Trigger mode: onlyNext')).toBeVisible()
    await page.selectOption('select', 'onlyPrevious')
    await expect(page.getByText('Trigger mode: onlyPrevious')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Verify User 31 is not loaded yet
    await expect(page.getByText('User 31')).toBeHidden()

    // Scroll to bottom - should NOT load page 3 since triggerMode='onlyPrevious'
    await scrollToBottom(page)
    await page.waitForTimeout(500)

    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to top, change triggerMode to 'onlyNext' (loads next pages)
    await scrollToTop(page)
    await page.selectOption('select', 'onlyNext')
    await expect(page.getByText('Trigger mode: onlyNext')).toBeVisible()

    // Scroll to bottom - should now load page 3 since triggerMode='onlyNext'
    await scrollToBottom(page)

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it toggles between preserving and not preserving URL when preserveUrl prop changes', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/toggles')

    await expect(page.getByText('Preserve URL: false')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Total items on page: 15')).toBeVisible()

    // Load page 2 and scroll to make it the most visible page
    await scrollToBottom(page)
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Total items on page: 30')).toBeVisible()

    // Scroll to page 2 content area to trigger URL update
    await page.getByText('User 20').scrollIntoViewIfNeeded()
    await expectQueryString(page, '2')
    await expect(infiniteScrollRequests().length).toBeGreaterThanOrEqual(1)

    // Enable preserveUrl mode - URL should no longer update
    await page.getByLabel('Preserve URL: false').check()
    await expect(page.getByText('Preserve URL: true')).toBeVisible()

    // Load page 3 and scroll to bottom
    await scrollToBottom(page)
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Total items on page: 40')).toBeVisible()

    // URL should still show page=2
    await page.waitForTimeout(500)
    expect(page.url()).toContain('page=2')
    await expect(infiniteScrollRequests().length).toBeGreaterThanOrEqual(2)

    // Disable preserveUrl again
    await page.getByLabel('Preserve URL: true').uncheck()
    await expect(page.getByText('Preserve URL: false')).toBeVisible()

    // Scroll to page 3 content area to trigger URL update
    await page.getByText('User 35').scrollIntoViewIfNeeded()
    await expectQueryString(page, '3')
  })
})

test.describe('Buffer margin configuration', () => {
  test('it loads the next page early when buffer margin is configured', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-end-buffer')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll close to bottom but not all the way - the buffer should trigger loading earlier
    // With buffer=200, it should trigger when the end element is 200px into the viewport
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    const viewportHeight = await page.evaluate(() => window.innerHeight)

    // Scroll to a position that's close to the bottom but leaves more than 200px
    // This should NOT trigger loading yet (without buffer, we'd need to be closer)
    const scrollPosition = pageHeight - viewportHeight - 300 // 300px from bottom
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition)

    // Should not have triggered loading yet
    await expect(infiniteScrollRequests().length).toBe(0)
    await expect(page.getByText('User 16')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Now scroll to a position that's within the buffer zone (less than 200px from bottom)
    // This should trigger loading due to the buffer
    const bufferScrollPosition = pageHeight - viewportHeight - 150 // 150px from bottom
    await page.evaluate((pos) => window.scrollTo(0, pos), bufferScrollPosition)

    // Should trigger loading due to buffer
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)
  })

  test('it loads the previous page early when buffer margin is configured', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-start-buffer?page=3')

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('User 30')).toBeHidden()

    // It automatically loads page 2 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll close to top but not all the way - the buffer should trigger loading earlier
    // With buffer=200, it should trigger when the start element is 200px into the viewport

    // Scroll to a position that's close to the top but leaves more than 200px
    // This should NOT trigger loading yet (without buffer, we'd need to be closer)
    await page.evaluate(() => window.scrollTo(0, 300)) // 300px from top

    // Should not have triggered loading yet
    await expect(infiniteScrollRequests().length).toBe(1) // Still just the initial load
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Now scroll to a position that's within the buffer zone (less than 200px from top)
    // This should trigger loading due to the buffer
    await page.evaluate(() => window.scrollTo(0, 150)) // 150px from top

    // Should trigger loading due to buffer
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)
  })
})

test.describe('Directional trigger constraints', () => {
  test('it only loads previous pages when trigger is set to start', async ({ page }) => {
    requests.listen(page)
    // Start on page 2 to verify page 1 auto-loads due to visible start trigger
    await page.goto('/infinite-scroll/trigger-start-buffer?page=2')

    // Initially page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()

    // Page 1 should auto-load because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Should have made 1 request to load page 1
    await expect(infiniteScrollRequests().length).toBe(1)

    // Now scroll to the bottom - should NOT trigger loading page 3 since trigger=start
    await scrollToBottom(page)
    await page.waitForTimeout(500)
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()
    // Should still be 1 request (only the initial auto-load of page 1)
    await expect(infiniteScrollRequests().length).toBe(1)
  })

  test('it only loads next pages when trigger is set to end', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-end-buffer?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()

    // Scroll to the top of the page - should NOT trigger loading since trigger=end
    await scrollToTop(page)
    await page.waitForTimeout(500)
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(0)
  })

  test('it loads pages in both directions when trigger is set to both', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both?page=2')

    // Initially, page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()

    // It automatically loads page 1 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll to bottom to trigger loading page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2)

    // Verify all three pages are now loaded (users 1-40)
    await expect(page.getByText('User 1', { exact: true })).toBeVisible() // Page 1
    await expect(page.getByText('User 15')).toBeVisible() // Page 1
    await expect(page.getByText('User 16')).toBeVisible() // Page 2
    await expect(page.getByText('User 30')).toBeVisible() // Page 2
    await expect(page.getByText('User 31')).toBeVisible() // Page 3
    await expect(page.getByText('User 40')).toBeVisible() // Page 3
  })
})

test.describe('DOM element ordering', () => {
  test('it maintains correct DOM element order when pages load out of sequence', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/trigger-both?page=2')

    // Initially, page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    // It automatically loads page 1 because the start trigger is visible
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom to trigger loading page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Get all user cards and check their order in the DOM
    const userIds = await getUserIdsFromDOM(page)

    // Verify the DOM order: should start with user 1, have user 20 somewhere in middle, end with user 40
    expect(userIds[0]).toBe(1) // First user should be User 1
    expect(userIds.includes(20)).toBe(true) // User 20 should be present (middle of page 2)
    expect(userIds[userIds.length - 1]).toBe(40) // Last user should be User 40

    // Verify all users from pages 1-3 are present (users 1-40) and in ascending order
    expect(userIds).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
  })

  test('it maintains correct DOM element order in reverse pagination mode', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/reverse?page=2')

    // Initially, page 2 should be visible (users 11-25 in reverse mode)
    await expect(page.getByText('User 11')).toBeVisible()
    await expect(page.getByText('User 25')).toBeVisible()

    // It automatically loads page 3 because the start trigger is visible (users 1-10)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 10')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom to trigger loading page 1 (users 26-40)
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 26')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Get all user cards and check their order in the DOM
    const userIds = await getUserIdsFromDOM(page)

    // In reverse mode, DOM order should still be 1-40 (logical order maintained)
    expect(userIds[0]).toBe(1) // First user should be User 1
    expect(userIds.includes(20)).toBe(true) // User 20 should be present (middle of page 2)
    expect(userIds[userIds.length - 1]).toBe(40) // Last user should be User 40

    // Verify all users from pages 1-3 are present (users 1-40) and in ascending order
    expect(userIds).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
  })
})

test.describe('Component customization', () => {
  test('it renders as a custom HTML element when using the as prop', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/custom-element')

    // Verify the InfiniteScroll component renders as a section element
    const container = await page.locator('section[data-testid="infinite-scroll-container"]')
    await expect(container).toBeVisible()

    // Verify it still functions as infinite scroll
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll to trigger loading next page
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
  })
})

test.describe('URL query string management', () => {
  test('it assigns page tracking attributes to dynamically loaded items', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/update-query-string')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll to bottom to load page 2
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom again to load page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Verify data attributes are set correctly for infinite scroll
    const dataAttrs = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[data-user-id]'))
      return elements.map((el) => ({
        userId: parseInt(el.getAttribute('data-user-id') || '0'),
        infiniteScrollPage: el.getAttribute('data-infinite-scroll-page'),
      }))
    })

    // Verify that we have elements from all 3 pages with correct page attributes
    const page1Elements = dataAttrs.filter((el) => el.infiniteScrollPage === '1')
    const page2Elements = dataAttrs.filter((el) => el.infiniteScrollPage === '2')
    const page3Elements = dataAttrs.filter((el) => el.infiniteScrollPage === '3')

    expect(page1Elements.length).toBe(15) // Users 1-15
    expect(page2Elements.length).toBe(15) // Users 16-30
    expect(page3Elements.length).toBe(10) // Users 31-40

    // Verify the page attributes are assigned to the correct user IDs
    expect(page1Elements.every((el) => el.userId >= 1 && el.userId <= 15)).toBe(true)
    expect(page2Elements.every((el) => el.userId >= 16 && el.userId <= 30)).toBe(true)
    expect(page3Elements.every((el) => el.userId >= 31 && el.userId <= 40)).toBe(true)
  })

  test('it updates the URL to reflect the most visible page during scrolling', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/update-query-string')

    // Initially should be on page 1 (no page param means page 1)
    expect(page.url()).not.toContain('page=')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll to bottom to load page 2
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom again to load page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    // Test URL updates at different scroll positions using smooth scrolling
    await smoothScrollTo(page, 0)
    await expectQueryString(page, '1')

    await smoothScrollTo(page, Math.floor(pageHeight / 2))
    await expectQueryString(page, '2')

    await smoothScrollTo(page, pageHeight)
    await expectQueryString(page, '3')

    await smoothScrollTo(page, Math.floor(pageHeight / 2))
    await expectQueryString(page, '2')

    await smoothScrollTo(page, 0)
    await expectQueryString(page, '1')

    await smoothScrollTo(page, pageHeight)
    await expectQueryString(page, '3')
  })

  test('it preserves the original URL when preserveUrl is enabled', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/preserve-url?page=2')

    // Initially should be on page 2 and URL should be preserved
    expect(page.url()).toContain('page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    // Wait for page 1 to auto-load (trigger=both behavior)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to bottom to load page 3
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    const pageHeight = await page.evaluate(() => document.body.scrollHeight)

    // Test multiple scroll positions - URL should never change from page=2
    await smoothScrollTo(page, 0) // Top
    await page.waitForTimeout(250) // Wait for debounce
    expect(page.url()).toContain('page=2')

    await smoothScrollTo(page, Math.floor(pageHeight / 2)) // Middle
    await page.waitForTimeout(250)
    expect(page.url()).toContain('page=2')

    await smoothScrollTo(page, pageHeight) // Bottom
    await page.waitForTimeout(250)
    expect(page.url()).toContain('page=2')

    await smoothScrollTo(page, 0) // Back to top
    await page.waitForTimeout(250)
    expect(page.url()).toContain('page=2')
  })

  test('it preserves relative URL format when updating query string', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/update-query-string')

    // Verify we start with a relative URL
    const initialUrl = await page.evaluate(() => window.testing.pageUrl)
    expect(initialUrl).toBe('/infinite-scroll/update-query-string')
    expect(initialUrl).not.toContain('http')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to User 20 area (middle of page 2) to trigger URL update to page=2
    const user20 = page.getByText('User 20')
    await user20.scrollIntoViewIfNeeded()
    await expectQueryString(page, '2')

    // Verify the internal Inertia page URL is still relative
    const updatedUrl = await page.evaluate(() => window.testing.pageUrl)
    expect(updatedUrl).toContain('page=2')
    expect(updatedUrl).not.toContain('http')
    expect(updatedUrl).toMatch(/^\/infinite-scroll/)
  })

  test('it preserves absolute URL format when updating query string', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/update-query-string?absolutePageUrl=1')

    // Verify we start with an absolute URL
    const initialUrl = await page.evaluate(() => window.testing.pageUrl)
    expect(initialUrl).toContain('http://localhost')
    expect(initialUrl).toContain('/infinite-scroll/update-query-string')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Scroll to User 20 area (middle of page 2) to trigger URL update to page=2
    const user20 = page.getByText('User 20')
    await user20.scrollIntoViewIfNeeded()
    await expectQueryString(page, '2')

    // Verify the internal Inertia page URL is still absolute
    const updatedUrl = await page.evaluate(() => window.testing.pageUrl)
    expect(updatedUrl).toContain('page=2')
    expect(updatedUrl).toContain('http://localhost')
    expect(updatedUrl).toContain('/infinite-scroll/update-query-string')
  })
})

test.describe('Scroll position preservation', () => {
  test('it maintains scroll position when loading previous pages', async ({ page, context }) => {
    await page.goto('/infinite-scroll/trigger-both?page=3')

    // Wait for page 2 to load...
    await expect(page.getByText('User 16')).toBeVisible()

    // Scroll to the top of the page to load page 1
    await scrollToTop(page)

    // Wait for loading to start so we capture a stable "before" state
    await expect(page.getByText('Loading...')).toBeVisible()

    const beforePosition = await getUserCardPosition(page, '16')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Wait for scroll restoration to complete
    await expect
      .poll(async () => {
        const position = await getUserCardPosition(page, '16')
        return position.viewportTop
      })
      .toBeCloseTo(beforePosition.viewportTop, 0)

    const afterPosition = await getUserCardPosition(page, '16')
    expect(afterPosition.viewportTop).toBeCloseTo(beforePosition.viewportTop, 0)
  })

  test('it maintains scroll position when loading next pages', async ({ page }) => {
    await page.goto('/infinite-scroll/trigger-both')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll to the bottom of the page to load page 2
    await scrollToBottom(page)

    await expect(page.getByText('Loading...')).toBeVisible()
    const beforePosition = await getUserCardPosition(page, '15')
    await expect(page.getByText('Loading...')).toBeVisible()

    // Wait for any initial loading to complete
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    const afterPosition = await getUserCardPosition(page, '15')

    expect(afterPosition.viewportTop).toBeCloseTo(beforePosition.viewportTop, 0)
  })

  test('it maintains scroll position when loading previous pages with buffer margin', async ({ page }) => {
    await page.goto('/infinite-scroll/trigger-start-buffer?page=3')

    // Wait for page 2 to load automatically...
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    // Get initial scroll position and User 16 position
    const initialScrollY = await page.evaluate(() => window.scrollY)

    // Scroll to trigger buffer zone for loading page 1 (within 200px buffer)
    await page.evaluate(() => window.scrollTo(0, 100))
    await page.waitForTimeout(50)
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 16')).toBeVisible()

    // Verify the final scroll position accounts for new content
    const finalScrollY = await page.evaluate(() => window.scrollY)
    expect(finalScrollY).toBeGreaterThan(initialScrollY) // Should scroll down to maintain relative position

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible() // Page 3 content
    await expect(page.getByText('User 40')).toBeVisible()
  })

  test('it maintains scroll position when loading next pages with buffer margin', async ({ page }) => {
    await page.goto('/infinite-scroll/trigger-end-buffer')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    // Scroll to bottom to trigger loading, similar to the working test
    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()
    const beforePosition = await getUserCardPosition(page, '15')

    // Wait for loading to complete
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    const afterPosition = await getUserCardPosition(page, '15')

    expect(afterPosition.viewportTop).toBeCloseTo(beforePosition.viewportTop, 0)
  })

  test('it maintains scroll position when first child element is invisible', async ({ page }) => {
    await page.goto('/infinite-scroll/invisible-first-child?page=2')

    // Verify the invisible element exists but is not visible
    const hiddenElement = await page.locator('text="Hidden first element"')
    await expect(hiddenElement).toBeAttached()
    await expect(hiddenElement).toBeHidden()

    // Page 1 loads immediately since the start trigger is visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()

    // Make sure the browser didn't scroll to the top...
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(100 * 15)
  })
})

test.describe('Scrollable container support', () => {
  test('it loads pages in both directions when infinite scroll is within a scrollable container', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/scroll-container?page=2')

    // Get the scrollable container element
    const scrollContainer = await page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    // Initially, page 2 should be visible
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    // It automatically loads page 1 because the start trigger is visible within the container
    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll within the container (not the page) to load page 3
    await scrollElementToBottom(scrollContainer)
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2)

    // Verify all three pages are now loaded within the container
    await expect(page.getByText('User 1', { exact: true })).toBeVisible() // Page 1
    await expect(page.getByText('User 20')).toBeVisible() // Page 2
    await expect(page.getByText('User 40')).toBeVisible() // Page 3
  })

  test('it updates query parameters based on visible content within a scrollable container', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/scroll-container')

    // Initially should be on page 1 (no page param)
    expect(page.url()).not.toContain('page=')

    const scrollContainer = await page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    // Load all 3 pages first
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll container to load page 2
    await scrollElementToBottom(scrollContainer)
    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    // Scroll container again to load page 3
    await scrollElementToBottom(scrollContainer)
    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    // Helper function to scroll container smoothly
    const smoothScrollContainerTo = async (targetY: number) => {
      await scrollContainer.evaluate((container, top) => container.scrollTo({ top, behavior: 'smooth' }), targetY)
      await page.waitForTimeout(250)
    }

    // Helper function to check URL updates with container scrolling
    const expectQueryStringInContainer = async (expectedPage: string) => {
      if (expectedPage === '1') {
        await page.waitForFunction(() => !window.location.search.includes('page='), { timeout: 1000 })
        expect(page.url()).not.toContain('page=')
      } else {
        await page.waitForFunction((pageNum) => window.location.search.includes(`page=${pageNum}`), expectedPage, {
          timeout: 1000,
        })
        expect(page.url()).toContain(`page=${expectedPage}`)
      }
    }

    const containerHeight = await scrollContainer.evaluate((container) => container.scrollHeight)

    // Test URL updates at different container scroll positions
    await smoothScrollContainerTo(0)
    await expectQueryStringInContainer('1')

    await smoothScrollContainerTo(Math.floor(containerHeight / 2))
    await expectQueryStringInContainer('2')

    await smoothScrollContainerTo(containerHeight)
    await expectQueryStringInContainer('3')

    await smoothScrollContainerTo(0)
    await expectQueryStringInContainer('1')
  })

  test('it maintains scroll position when loading previous pages in container', async ({ page }) => {
    await page.goto('/infinite-scroll/scroll-container?page=3')

    const scrollContainer = await page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    // Wait for page 2 to load automatically...
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    // Scroll container to top to trigger loading page 1
    await scrollElementSmoothTo(scrollContainer, 0)

    // Wait for loading to start or data to appear
    await expect(page.getByText('Loading more users...').or(page.getByText('User 1', { exact: true }))).toBeVisible()
    const beforePosition = await getUserCardPositionInContainer(page, scrollContainer, '16')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    // Wait for scroll restoration to complete
    await expect
      .poll(async () => {
        const position = await getUserCardPositionInContainer(page, scrollContainer, '16')
        return position.viewportTop
      })
      .toBeCloseTo(beforePosition.viewportTop, 0)

    const afterPosition = await getUserCardPositionInContainer(page, scrollContainer, '16')
    expect(afterPosition.viewportTop).toBeCloseTo(beforePosition.viewportTop, 0)
  })

  test('it maintains scroll position when loading next pages in container', async ({ page }) => {
    await page.goto('/infinite-scroll/scroll-container')

    const scrollContainer = await page.locator('[data-testid="scroll-container"]')
    await expect(scrollContainer).toBeVisible()

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()

    // Scroll down within container to see User 15 and trigger loading page 2
    await scrollElementToBottom(scrollContainer)

    const beforePosition = await getUserCardPositionInContainer(page, scrollContainer, '15')

    await expect(page.getByText('Loading more users...')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    const afterPosition = await getUserCardPositionInContainer(page, scrollContainer, '15')

    expect(afterPosition.viewportTop).toBeCloseTo(beforePosition.viewportTop, 0)
  })

  test('it does not treat overflow-x: hidden as a scroll container', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 400 })
    requests.listen(page)

    await page.goto('/infinite-scroll/overflow-x')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()

    expect(infiniteScrollRequests().length).toBe(1)
    await expect(page.getByText('User 31')).toBeHidden()

    await page.waitForTimeout(1000)

    await expect(page.getByText('User 31')).toBeHidden()
  })
})

test.describe('Horizontal scrolling support', () => {
  test('it loads pages horizontally when scrolling right in a horizontal container', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/horizontal-scroll')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    const scrollContainer = await page.locator('div[style*="overflow-x: scroll"]')

    await expect(infiniteScrollRequests().length).toBe(0)

    // Scroll right to trigger loading page 2
    await scrollContainer.evaluate((container) => (container.scrollLeft = container.scrollWidth))
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    // Scroll right again to trigger loading page 3
    await scrollContainer.evaluate((container) => (container.scrollLeft = container.scrollWidth))
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2)
    await expect(page.getByText('User 40')).toBeVisible()

    // Try scrolling right once more - should NOT trigger loading since User 40 is the last one
    await scrollContainer.evaluate((container) => (container.scrollLeft = container.scrollWidth))
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(2) // Should still be 2, no additional request

    await page.waitForTimeout(300)
    expect(page.url()).toContain('page=3')

    // Check if the data-infinite-scroll attribute is set correctly for horizontal scroll
    const user15 = await page.locator('[data-user-id="15"]')
    const user16 = await page.locator('[data-user-id="16"]')
    const user30 = await page.locator('[data-user-id="30"]')
    const user31 = await page.locator('[data-user-id="31"]')
    const user40 = await page.locator('[data-user-id="40"]')

    await expect(user15).toHaveAttribute('data-infinite-scroll-page', '1')
    await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user30).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user31).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user40).toHaveAttribute('data-infinite-scroll-page', '3')
  })
})

test.describe('Programmatic access via component ref', () => {
  test('it allows manual loading via ref methods', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/programmatic-ref?page=2')

    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 15')).toBeHidden()
    await expect(page.getByText('User 31')).toBeHidden()

    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.getByRole('button', { name: 'Load Previous (Ref)' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(1)

    await page.getByRole('button', { name: 'Load Next (Ref)' }).click()
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 31')).toBeVisible()
    await expect(page.getByText('User 40')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()
    await expect(infiniteScrollRequests().length).toBe(2)
  })

  test('it correctly reports hasMore states at page boundaries', async ({ page }) => {
    requests.listen(page)

    await page.goto('/infinite-scroll/programmatic-ref?page=1')
    await expect(page.getByText('Has more previous items: false')).toBeVisible()
    await expect(page.getByText('Has more next items: true')).toBeVisible()

    await page.goto('/infinite-scroll/programmatic-ref?page=3')
    await expect(page.getByText('Has more previous items: true')).toBeVisible()
    await expect(page.getByText('Has more next items: false')).toBeVisible()
  })
})

test.describe('Grid layout support', () => {
  test('it loads pages in a CSS grid layout', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/grid')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 60')).toBeVisible()
    await expect(page.getByText('User 61')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(0)

    await scrollToBottom(page)
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 61')).toBeVisible()
    await expect(page.getByText('User 120')).toBeVisible()
    await expect(page.getByText('User 121')).toBeHidden()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    await scrollToBottom(page)
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 121')).toBeVisible()
    await expect(page.getByText('User 180')).toBeVisible()
    await expect(page.getByText('User 181')).toBeHidden()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    await scrollToBottom(page)
    await expect(page.getByText('Loading more users...')).toBeVisible()

    await expect(page.getByText('User 181')).toBeVisible()
    await expect(page.getByText('User 240')).toBeVisible()
    await expect(page.getByText('Loading more users...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(3)

    await scrollToBottom(page)
    await expect(page.getByText('Loading more users...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(3)
  })
})

test.describe('Data table layout support', () => {
  test('it loads pages in a table layout with large datasets', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/data-table')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 250')).toBeVisible()
    await expect(page.getByText('User 251')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(0)

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 251')).toBeVisible()
    await expect(page.getByText('User 500')).toBeVisible()
    await expect(page.getByText('User 501')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(1)

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 501')).toBeVisible()
    await expect(page.getByText('User 750')).toBeVisible()
    await expect(page.getByText('User 751')).toBeHidden()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(2)

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeVisible()

    await expect(page.getByText('User 751')).toBeVisible()
    await expect(page.getByText('User 1000')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(3)

    await scrollToBottom(page)
    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(3)

    const user500 = await page.locator('[data-user-id="500"]')
    const user501 = await page.locator('[data-user-id="501"]')
    const user1000 = await page.locator('[data-user-id="1000"]')

    await expect(user500).toHaveAttribute('data-infinite-scroll-page', '2')
    await expect(user501).toHaveAttribute('data-infinite-scroll-page', '3')
    await expect(user1000).toHaveAttribute('data-infinite-scroll-page', '4')
  })
})

test.describe('Empty dataset handling', () => {
  test('it handles empty datasets gracefully', async ({ page }) => {
    requests.listen(page)
    await page.goto('/infinite-scroll/empty')

    await expect(page.getByText('Empty Dataset Test')).toBeVisible()
    await expect(page.getByText('No users found.')).toBeVisible()
    await expect(page.getByText('Loading...')).toBeHidden()

    await expect(infiniteScrollRequests().length).toBe(0)

    await scrollToBottom(page)
    await page.waitForTimeout(500)

    await expect(page.getByText('Loading...')).toBeHidden()
    await expect(infiniteScrollRequests().length).toBe(0)

    await expect(page.getByText('No users found.')).toBeVisible()
  })
})

Object.entries({
  ref: '/infinite-scroll/custom-triggers-ref',
  selector: '/infinite-scroll/custom-triggers-selector',
  'ref-object': '/infinite-scroll/custom-triggers-ref-object',
}).forEach(([key, path]) => {
  test.describe('Custom triggers and slot using ' + key, () => {
    test('it loads pages when scrolling to custom triggers and updates URL', async ({ page }) => {
      requests.listen(page)
      await page.goto(path)

      // Initially should only see users 1-15
      await expect(page.getByText('User 1', { exact: true })).toBeVisible()
      await expect(page.getByText('User 15')).toBeVisible()
      await expect(page.getByText('User 16')).toBeHidden()

      // URL should not have page param initially
      expect(page.url()).not.toContain('page=')

      // Scroll to bottom to trigger loading users 16-30
      await scrollToBottom(page)
      // Wait for loading to start or data to appear (whichever comes first)
      await expect(page.getByText('Loading...').or(page.getByText('User 16'))).toBeVisible()
      await expect(page.getByText('User 16')).toBeVisible()
      await expect(page.getByText('User 30')).toBeVisible()
      await expect(page.getByText('Loading...')).toBeHidden()
      await expect(infiniteScrollRequests().length).toBe(1)

      // Load page 3 by scrolling to tfoot (custom after trigger)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500))
      // Wait for loading to start or data to appear (whichever comes first)
      await expect(page.getByText('Loading...').or(page.getByText('User 31'))).toBeVisible()
      await expect(page.getByText('User 31')).toBeVisible()
      await expect(page.getByText('User 40')).toBeVisible()
      await expect(page.getByText('Loading...')).toBeHidden()
      await expect(infiniteScrollRequests().length).toBe(2)

      const pageHeight = await page.evaluate(() => document.body.scrollHeight)

      // Test URL updates at different scroll positions using smooth scrolling
      await smoothScrollTo(page, 0)
      await expectQueryString(page, '1')

      await smoothScrollTo(page, Math.floor(pageHeight / 2))
      await expectQueryString(page, '2')

      await smoothScrollTo(page, pageHeight)
      await expectQueryString(page, '3')

      await smoothScrollTo(page, 0)
      await expectQueryString(page, '1')
    })

    test('it auto-loads previous pages and responds to custom before trigger', async ({ page }) => {
      requests.listen(page)
      await page.goto(path + '?page=3')

      // Initially should see users 31-40
      await expect(page.getByText('User 31')).toBeVisible()
      await expect(page.getByText('User 40')).toBeVisible()
      await expect(page.getByText('User 30')).toBeHidden()

      // Page 2 should auto-load because the before trigger (thead) is visible
      await expect(page.getByText('User 30')).toBeVisible()
      await expect(page.getByText('User 16')).toBeVisible()
      await expect(page.getByText('User 15')).toBeHidden()
      await expect(infiniteScrollRequests().length).toBe(1)

      // Scroll up to thead to trigger loading page 1
      await page.evaluate(() => window.scrollTo(0, 300))

      await expect(page.getByText('User 15')).toBeVisible()
      await expect(page.getByText('User 1', { exact: true })).toBeVisible()
      await expect(infiniteScrollRequests().length).toBe(2)

      // Verify all three pages are loaded with correct data attributes
      const user1 = await page.locator('[data-user-id="1"]')
      const user16 = await page.locator('[data-user-id="16"]')
      const user40 = await page.locator('[data-user-id="40"]')

      await expect(user1).toHaveAttribute('data-infinite-scroll-page', '1')
      await expect(user16).toHaveAttribute('data-infinite-scroll-page', '2')
      await expect(user40).toHaveAttribute('data-infinite-scroll-page', '3')
    })
  })
})

Object.entries({
  'refresh state': '/infinite-scroll/filtering/refresh-state',
  'preserve state': '/infinite-scroll/filtering/preserve-state',
}).forEach(([key, path]) => {
  test.describe(`Query parameter handling (${key})`, () => {
    test('it keeps the existing query parameters intact when updating the page param', async ({ page }) => {
      requests.listen(page)
      await page.goto(path)
      await page.setViewportSize({ width: 1200, height: 400 })

      await page.getByRole('link', { name: 'N-Z' }).first().click()

      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()
      await expect(page.getByText('Current filter: n-z').first()).toBeVisible()
      expect(page.url()).toContain('filter=n-z')
      expect(page.url()).not.toContain('page=')

      // Scroll to bottom to load page 2
      await scrollToBottom(page)
      await expect(page.getByText('Woodrow Kuvalis')).toBeVisible()

      // Assert filter=n-z&page=2
      await scrollToBottom(page)
      await expectQueryString(page, '2')
      expect(page.url()).toContain('filter=n-z')
      expect(page.url()).toContain('page=2')

      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()
      await expect(page.getByText('Woodrow Kuvalis')).toBeVisible()

      await expect(infiniteScrollRequests().length).toBe(1)
    })

    test('it resets the infinite scroll component when navigating to the same page with different query params', async ({
      page,
    }) => {
      requests.listen(page)
      await page.goto(path)

      await page.getByRole('link', { name: 'A-M' }).first().click()

      await expect(page.getByText('Adelle Crona DVM')).toBeVisible()
      await expect(page.getByText('Breana Herzog')).toBeVisible()
      await expect(page.getByText('Current filter: a-m').first()).toBeVisible()

      await scrollToBottom(page)
      await expect(page.getByText('Camylle Metz Sr.')).toBeVisible()

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000))
      await expectQueryString(page, '2')
      expect(page.url()).toContain('filter=a-m')
      expect(page.url()).toContain('page=2')

      await expect(infiniteScrollRequests().length).toBe(1)

      await page.getByRole('link', { name: 'N-Z' }).first().click()

      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()
      await expect(page.getByText('Current filter: n-z').first()).toBeVisible()

      await expect(page.getByText('Adelle Crona DVM')).toBeHidden()
      await expect(page.getByText('Camylle Metz Sr.')).toBeHidden()

      expect(page.url()).toContain('filter=n-z')
      expect(page.url()).not.toContain('page=')

      await scrollToBottom(page)
      await expect(page.getByText('Woodrow Kuvalis')).toBeVisible()
      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()
      await expect(infiniteScrollRequests().length).toBe(2)
    })

    test('it resets the page and filter params when searching for a user', async ({ page }) => {
      requests.listen(page)
      await page.goto(path)
      await page.setViewportSize({ width: 1200, height: 400 })

      await page.getByRole('link', { name: 'N-Z' }).first().click()
      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()
      await expect(page.getByText('Current filter: n-z').first()).toBeVisible()

      await scrollToBottom(page)
      await expect(page.getByText('Woodrow Kuvalis')).toBeVisible()

      await scrollToBottom(page)
      await expectQueryString(page, '2')
      expect(page.url()).toContain('filter=n-z')
      expect(page.url()).toContain('page=2')

      // Search for 'adelle' in bottom input box
      await page.locator('input').nth(1).fill('adelle')

      await expect(page.getByText('Adelle Crona DVM')).toBeVisible()

      // Assert search=adelle (no page param, no filter param)
      expect(page.url()).toContain('search=adelle')
      expect(page.url()).not.toContain('page=')
      expect(page.url()).not.toContain('filter=')
      await expect(page.getByText('Current search: adelle').first()).toBeVisible()
      await expect(page.getByText('Current filter: none').first()).toBeVisible()

      // Assert only 'Adelle Crona DVM' is visible
      await expect(page.getByText('Niko Christiansen Jr.')).toBeHidden()
      await expect(page.getByText('Woodrow Kuvalis')).toBeHidden()

      // Click N-Z again (this should reset search and apply filter)
      await page.getByRole('link', { name: 'N-Z' }).first().click()
      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()

      // Assert filter=n-z (no page param, no search param)
      expect(page.url()).toContain('filter=n-z')
      expect(page.url()).not.toContain('page=')
      expect(page.url()).not.toContain('search=')
      await expect(page.getByText('Current filter: n-z').first()).toBeVisible()
      await expect(page.getByText('Current search: none').first()).toBeVisible()

      // Assert 'Adelle Crona DVM' is hidden, 'Niko Christiansen Jr.' is visible
      await expect(page.getByText('Adelle Crona DVM')).toBeHidden()
      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()

      await scrollToBottom(page)
      await expect(page.getByText('Woodrow Kuvalis')).toBeVisible()

      await scrollToBottom(page)
      await expectQueryString(page, '2')
      expect(page.url()).toContain('filter=n-z')
      expect(page.url()).toContain('page=2')

      await expect(page.getByText('Niko Christiansen Jr.')).toBeVisible()
      await expect(page.getByText('Woodrow Kuvalis')).toBeVisible()
    })

    test('it can load additional content after removing the search filter', async ({ page }) => {
      requests.listen(page)
      await page.goto(path + '?filter=n-z')

      await page.locator('input').nth(0).fill('adelle')
      await expect(page.getByText('Adelle Crona DVM')).toBeVisible()

      await page.waitForTimeout(500)

      const userIds = await getUserIdsFromDOM(page)
      expect(userIds.length).toBe(1)

      await page.locator('input').nth(0).fill('')

      // Wait for second user
      await expect(page.getByText('Alison Walter PhD')).toBeVisible()

      // Scroll to bottom to load more users
      await scrollToBottom(page)
      await expect(page.getByText('Camylle Metz Sr.')).toBeVisible()
    })
  })
})

test.describe('Router', () => {
  test('it can reload unrelated props without affecting infinite scroll', async ({ page }) => {
    await page.goto('/infinite-scroll/reload-unrelated')

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    const initialTime = await page.locator('#time-display').textContent()

    await page.locator('#reload-button').click()

    // Wait for reload to complete and verify timestamp changed
    await page.waitForTimeout(300)
    const updatedTime = await page.locator('#time-display').textContent()
    expect(updatedTime).not.toBe(initialTime)

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    await scrollToBottom(page)
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
  })

  test('it can prefetch a page with scroll props', async ({ page }) => {
    await page.goto('/infinite-scroll')

    const prefetchPromise = page.waitForResponse('/infinite-scroll-with-link')
    await page.getByRole('link', { name: 'Go to InfiniteScrollWithLink (Prefetch)' }).hover()
    await page.waitForTimeout(75)
    await prefetchPromise

    requests.listen(page)
    await page.getByRole('link', { name: 'Go to InfiniteScrollWithLink (Prefetch)' }).click()
    await page.waitForURL('/infinite-scroll-with-link')
    await expect(requests.requests.length).toBe(0)

    // Verify infinite scroll works - check initial users
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    await scrollToBottom(page)
    await page.waitForTimeout(300)
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()

    await scrollToTop(page)
    await page.waitForTimeout(100)
    await page.getByRole('link', { name: 'Go back to Links' }).click()
    await page.waitForURL('/infinite-scroll')

    // Click the link again, should behave the same
    const prefetchPromise2 = page.waitForResponse('/infinite-scroll-with-link')
    await page.getByRole('link', { name: 'Go to InfiniteScrollWithLink (Prefetch)' }).hover()
    await page.waitForTimeout(75)
    await prefetchPromise2

    requests.listen(page)
    await page.getByRole('link', { name: 'Go to InfiniteScrollWithLink (Prefetch)' }).click()
    await page.waitForURL('/infinite-scroll-with-link')
    await expect(requests.requests.length).toBe(0)

    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    await scrollToBottom(page)
    await page.waitForTimeout(300)
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
  })

  test('it can navigate rapidly between pages with infinite scroll without errors', async ({ page }) => {
    test.setTimeout(10_000)
    consoleMessages.listen(page)

    await page.goto('/infinite-scroll')

    // Navigate back and forth 20 times rapidly
    for (let i = 0; i < 20; i++) {
      await page.getByRole('link', { name: 'Go to InfiniteScrollWithLink', exact: true }).click()
      await expect(page.getByRole('link', { name: 'Go back to Links' })).toBeVisible()
      expect(consoleMessages.errors).toHaveLength(0)
      await page.getByRole('link', { name: 'Go back to Links' }).click()
      await expect(page.getByRole('link', { name: 'Go to InfiniteScrollWithLink', exact: true })).toBeVisible()
      expect(consoleMessages.errors).toHaveLength(0)
    }

    await page.getByRole('link', { name: 'Go to InfiniteScrollWithLink', exact: true }).click()

    // Check if the infinite scroll content is still functional
    await expect(page.getByText('User 1', { exact: true })).toBeVisible()
    await expect(page.getByText('User 15')).toBeVisible()
    await expect(page.getByText('User 16')).toBeHidden()

    await scrollToBottom(page)
    await expect(page.getByText('User 16')).toBeVisible()
    await expect(page.getByText('User 30')).toBeVisible()
    await expect(page.getByText('User 31')).toBeHidden()
  })
})
