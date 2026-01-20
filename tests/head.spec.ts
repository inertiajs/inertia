import { expect, Page, test } from '@playwright/test'

async function getInertiaHeadHTML(page: Page) {
  return await page.evaluate(() => {
    const inertiaElements = Array.from(document.querySelector('head').querySelectorAll('[inertia]'))

    return inertiaElements.map((el) => el.outerHTML).join('')
  })
}

test.describe('Head component', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')
  })

  test('replaces the original title element', async ({ page }) => {
    await page.goto('/head')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    const titles = await page.evaluate(() => {
      const allTitles = Array.from(document.querySelectorAll('title'))
      return {
        total: allTitles.length,
        inertiaTitle: allTitles.find((t) => t.hasAttribute('inertia'))?.textContent,
        allHaveInertiaAttribute: allTitles.every((t) => t.hasAttribute('inertia')),
      }
    })

    expect(titles.total).toBe(1)
    expect(titles.inertiaTitle).toBe('Test Head Component')
    expect(titles.allHaveInertiaAttribute).toBe(true)
  })

  test('opt-in to using data-inertia instead of inertia attribute', async ({ page }) => {
    await page.goto('/head/dataset')
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
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="viewport" content="width=device-width, initial-scale=1" inertia="">' +
        '<meta name="description" content="This is an &quot;escape&quot; example" inertia="">' +
        '<meta name="undefined" content="undefined" inertia="">' +
        '<meta name="number" content="0" inertia="">' +
        '<meta name="boolean" content="true" inertia="">' +
        '<meta name="false" content="false" inertia="">' +
        '<meta name="null" content="null" inertia="">' +
        '<meta name="float" content="3.14" inertia="">' +
        '<meta name="xss" content="&lt;script&gt;alert(\'xss\')&lt;/script&gt;" inertia="">' +
        '<meta name="ampersand" content="Laravel &amp; Inertia" inertia="">' +
        '<meta name="unicode" content="Hélló! 🎉" inertia="">' +
        '<title inertia="">Test Head Component</title>',
    )
  })

  test('dynamically updates head elements', async ({ page }) => {
    await page.goto('/head/reactive')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    let headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="author" content="Test Author" inertia="">' +
        '<meta name="description" content="Initial description" inertia="description">' +
        '<title inertia="">Initial Title</title>',
    )

    await page.click('#update-meta')
    await page.waitForTimeout(100)

    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="author" content="Test Author" inertia="">' +
        '<meta name="description" content="Updated description" inertia="description">' +
        '<title inertia="">Updated Title</title>',
    )
  })

  test('renders multiple different head element tags', async ({ page }) => {
    await page.goto('/head/mixed')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta charset="utf-8" inertia="">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1" inertia="">' +
        '<meta name="description" content="Testing multiple head elements" inertia="">' +
        '<meta name="keywords" content="test, vue, inertia" inertia="">' +
        '<meta property="og:title" content="Open Graph Title" inertia="">' +
        '<meta property="og:description" content="Open Graph Description" inertia="">' +
        '<link rel="icon" href="/favicon.ico" inertia="">' +
        '<link rel="stylesheet" href="/custom.css" inertia="">' +
        '<link rel="canonical" href="https://example.com/page" inertia="">' +
        '<title inertia="">Multiple Elements Test</title>',
    )
  })

  test('handles conditional rendering', async ({ page }) => {
    await page.goto('/head/conditional')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    let headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" inertia="">' +
        '<meta name="description" content="This description is conditionally rendered" inertia="description">' +
        '<title inertia="">Conditional Rendering</title>',
    )

    await page.click('#toggle-description')
    await page.waitForTimeout(100)
    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" inertia="">' +
        '<title inertia="">Conditional Rendering</title>',
    )

    await page.click('#toggle-keywords')
    await page.waitForTimeout(100)
    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" inertia="">' +
        '<title inertia="">Conditional Rendering</title>' +
        '<meta name="keywords" content="vue, test, conditional" inertia="keywords">',
    )

    await page.click('#toggle-description')
    await page.waitForTimeout(100)
    headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" inertia="">' +
        '<title inertia="">Conditional Rendering</title>' +
        '<meta name="keywords" content="vue, test, conditional" inertia="keywords">' +
        '<meta name="description" content="This description is conditionally rendered" inertia="description">',
    )
  })

  test('handles head without title prop', async ({ page }) => {
    await page.goto('/head/without-title')
    await page.waitForTimeout(100)

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe('<meta name="test" content="no title provided" inertia="">')
  })

  test('handles head with title prop', async ({ page }) => {
    await page.goto('/head/with-title')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="description" content="Title set via children, not prop" inertia="">' +
        '<title inertia="">Title from Children</title>',
    )
  })

  test('preserves head-key for proper updates', async ({ page }) => {
    await page.goto('/head/reactive')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    const descriptionInertiaAttr = await page.locator('meta[name="description"]').getAttribute('inertia')
    await expect(descriptionInertiaAttr).toBe('description')

    await page.click('#update-meta')
    await page.waitForTimeout(100)

    const descriptionCount = await page.locator('meta[name="description"]').count()
    await expect(descriptionCount).toBe(1)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Updated description')
  })

  test('does not duplicate meta tags on navigation', async ({ page }) => {
    await page.goto('/head/mixed')
    await page.waitForSelector('title[inertia]', { state: 'attached' })

    await page.click('#navigate-away')
    await page.waitForFunction(() => document.querySelector('title[inertia]')?.textContent === 'Home')

    await page.click('#navigate-back')
    await page.waitForFunction(() => document.querySelector('title[inertia]')?.textContent === 'Multiple Elements Test')

    const expectedMixedContent =
      '<meta charset="utf-8" inertia="">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" inertia="">' +
      '<meta name="description" content="Testing multiple head elements" inertia="">' +
      '<meta name="keywords" content="test, vue, inertia" inertia="">' +
      '<meta property="og:title" content="Open Graph Title" inertia="">' +
      '<meta property="og:description" content="Open Graph Description" inertia="">' +
      '<link rel="icon" href="/favicon.ico" inertia="">' +
      '<link rel="stylesheet" href="/custom.css" inertia="">' +
      '<link rel="canonical" href="https://example.com/page" inertia="">' +
      '<title inertia="">Multiple Elements Test</title>'

    const headHTML = await getInertiaHeadHTML(page)
    expect(headHTML).toBe(expectedMixedContent)

    await page.goBack()
    await page.waitForSelector('title[inertia]', { state: 'attached' })
    const homeTitle = await page.evaluate(() => document.querySelector('title[inertia]')?.textContent)
    expect(homeTitle).toBe('Home')

    await page.goBack()
    await page.waitForSelector('title[inertia]', { state: 'attached' })
    const backToMixedHTML = await getInertiaHeadHTML(page)
    expect(backToMixedHTML).toBe(expectedMixedContent)
  })
})
