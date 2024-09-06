import { test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  let loadCount = 0

  page.on('load', () => {
    loadCount++

    if (loadCount > 1) {
      throw new Error('The page loaded more than once')
    }
  })

  await page.goto('/error-modal')
})
