import { expect, Page, test } from '@playwright/test'

async function getInertiaHeadHTML(page: Page) {
  return await page.evaluate(() => {
    const inertiaElements = Array.from(document.querySelector('head').querySelectorAll('[data-inertia]'))

    return inertiaElements.map((el) => el.outerHTML).join('')
  })
}

test.describe('Head component', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')
  })

  test('replaces the original title element', async ({ page }) => {
    await page.goto('/head')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    const titles = await page.evaluate(() => {
      const allTitles = Array.from(document.querySelectorAll('title'))
      return {
        total: allTitles.length,
        inertiaTitle: allTitles.find((t) => t.hasAttribute('data-inertia'))?.textContent,
        allHaveInertiaAttribute: allTitles.every((t) => t.hasAttribute('data-inertia')),
      }
    })

    expect(titles.total).toBe(1)
    expect(titles.inertiaTitle).toBe('Test Head Component')
    expect(titles.allHaveInertiaAttribute).toBe(true)
  })

  test('renders the title tag and children with proper escaping', async ({ page }) => {
    await page.goto('/head')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="viewport" content="width=device-width, initial-scale=1" data-inertia="">' +
        '<meta name="description" content="This is an &quot;escape&quot; example" data-inertia="">' +
        '<meta name="undefined" content="undefined" data-inertia="">' +
        '<meta name="number" content="0" data-inertia="">' +
        '<meta name="boolean" content="true" data-inertia="">' +
        '<meta name="false" content="false" data-inertia="">' +
        '<meta name="null" content="null" data-inertia="">' +
        '<meta name="float" content="3.14" data-inertia="">' +
        '<meta name="xss" content="&lt;script&gt;alert(\'xss\')&lt;/script&gt;" data-inertia="">' +
        '<meta name="ampersand" content="Laravel &amp; Inertia" data-inertia="">' +
        '<meta name="unicode" content="Hélló! 🎉" data-inertia="">' +
        '<title data-inertia="">Test Head Component</title>',
    )
  })

  test('dynamically updates head elements', async ({ page }) => {
    await page.goto('/head/reactive')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    let headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="author" content="Test Author" data-inertia="">' +
        '<meta name="description" content="Initial description" data-inertia="description">' +
        '<title data-inertia="">Initial Title</title>',
    )

    await page.click('#update-meta')
    await page.waitForTimeout(100)

    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="author" content="Test Author" data-inertia="">' +
        '<meta name="description" content="Updated description" data-inertia="description">' +
        '<title data-inertia="">Updated Title</title>',
    )
  })

  test('renders multiple different head element tags', async ({ page }) => {
    await page.goto('/head/mixed')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta charset="utf-8" data-inertia="">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1" data-inertia="">' +
        '<meta name="description" content="Testing multiple head elements" data-inertia="">' +
        '<meta name="keywords" content="test, vue, inertia" data-inertia="">' +
        '<meta property="og:title" content="Open Graph Title" data-inertia="">' +
        '<meta property="og:description" content="Open Graph Description" data-inertia="">' +
        '<link rel="icon" href="/favicon.ico" data-inertia="">' +
        '<link rel="stylesheet" href="/custom.css" data-inertia="">' +
        '<link rel="canonical" href="https://example.com/page" data-inertia="">' +
        '<title data-inertia="">Multiple Elements Test</title>',
    )
  })

  test('handles conditional rendering', async ({ page }) => {
    await page.goto('/head/conditional')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    let headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-inertia="">' +
        '<meta name="description" content="This description is conditionally rendered" data-inertia="description">' +
        '<title data-inertia="">Conditional Rendering</title>',
    )

    await page.click('#toggle-description')
    await page.waitForTimeout(100)
    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-inertia="">' +
        '<title data-inertia="">Conditional Rendering</title>',
    )

    await page.click('#toggle-keywords')
    await page.waitForTimeout(100)
    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-inertia="">' +
        '<title data-inertia="">Conditional Rendering</title>' +
        '<meta name="keywords" content="vue, test, conditional" data-inertia="keywords">',
    )

    await page.click('#toggle-description')
    await page.waitForTimeout(100)
    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-inertia="">' +
        '<title data-inertia="">Conditional Rendering</title>' +
        '<meta name="keywords" content="vue, test, conditional" data-inertia="keywords">' +
        '<meta name="description" content="This description is conditionally rendered" data-inertia="description">',
    )
  })

  test('handles head without title prop', async ({ page }) => {
    await page.goto('/head/without-title')
    await page.waitForTimeout(100)

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe('<meta name="test" content="no title provided" data-inertia="">')
  })

  test('handles head with title prop', async ({ page }) => {
    await page.goto('/head/with-title')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="description" content="Title set via children, not prop" data-inertia="">' +
        '<title data-inertia="">Title from Children</title>',
    )
  })

  test('preserves head-key for proper updates', async ({ page }) => {
    await page.goto('/head/reactive')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    const descriptionInertiaAttr = await page.locator('meta[name="description"]').getAttribute('data-inertia')
    await expect(descriptionInertiaAttr).toBe('description')

    await page.click('#update-meta')
    await page.waitForTimeout(100)

    const descriptionCount = await page.locator('meta[name="description"]').count()
    await expect(descriptionCount).toBe(1)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Updated description')
  })

  test('does not duplicate meta tags on navigation', async ({ page }) => {
    await page.goto('/head/mixed')
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })

    await page.click('#navigate-away')
    await page.waitForFunction(() => document.querySelector('title[data-inertia]')?.textContent === 'Home')

    await page.click('#navigate-back')
    await page.waitForFunction(
      () => document.querySelector('title[data-inertia]')?.textContent === 'Multiple Elements Test',
    )

    const expectedMixedContent =
      '<meta charset="utf-8" data-inertia="">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" data-inertia="">' +
      '<meta name="description" content="Testing multiple head elements" data-inertia="">' +
      '<meta name="keywords" content="test, vue, inertia" data-inertia="">' +
      '<meta property="og:title" content="Open Graph Title" data-inertia="">' +
      '<meta property="og:description" content="Open Graph Description" data-inertia="">' +
      '<link rel="icon" href="/favicon.ico" data-inertia="">' +
      '<link rel="stylesheet" href="/custom.css" data-inertia="">' +
      '<link rel="canonical" href="https://example.com/page" data-inertia="">' +
      '<title data-inertia="">Multiple Elements Test</title>'

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(expectedMixedContent)

    await page.goBack()
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })
    const homeTitle = await page.evaluate(() => document.querySelector('title[data-inertia]')?.textContent)
    expect(homeTitle).toBe('Home')

    await page.goBack()
    await page.waitForSelector('title[data-inertia]', { state: 'attached' })
    const backToMixedHTML = await getInertiaHeadHTML(page)
    expect(backToMixedHTML).toBe(expectedMixedContent)
  })
})
