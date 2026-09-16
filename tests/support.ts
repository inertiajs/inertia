import { expect, Page, Request, Response } from '@playwright/test'

export const clickAndWaitForResponse = async (
  page: Page,
  buttonText: string,
  url: string | null = null,
  element: 'link' | 'button' = 'link',
) => {
  const responsePromise = page.waitForResponse(url ?? page.url())
  await page.getByRole(element, { exact: true, name: buttonText }).click()
  return await responsePromise
}

export const pageLoads = {
  count: 0,

  watch(page: Page, maxLoads = 1) {
    this.count = 0

    page.on('load', () => {
      // Ignore load events from about:blank (Firefox fires these, Chromium doesn't)
      if (page.url() === 'about:blank') {
        return
      }

      this.count++

      if (this.count > maxLoads) {
        throw new Error('The page loaded more than once')
      }
    })
  },
}

export const consoleMessages = {
  errors: [] as string[],
  messages: [] as string[],

  listen(page: Page) {
    this.errors = []
    this.messages = []
    page.on('console', (msg) => this.messages.push(msg.text()))
    page.on('pageerror', (error: Error) => this.errors.push(error.message))
  },
}

export const requests = {
  requests: [] as Request[],
  finished: [] as Request[],
  failed: [] as Request[],
  responses: [] as Response[],
  _handlers: {} as Record<string, { page: Page; handler: (...args: any[]) => void }>,

  _replaceListener(page: Page, event: string, handler: (...args: any[]) => void) {
    const existing = this._handlers[event]

    if (existing) {
      existing.page.off(event, existing.handler)
    }

    this._handlers[event] = { page, handler }
    page.on(event, handler)
  },

  listen(page: Page) {
    this.requests = []
    this._replaceListener(page, 'request', (request: Request) => this.requests.push(request))
  },

  listenForFinished(page: Page) {
    this.finished = []
    this._replaceListener(page, 'requestfinished', (request: Request) => this.finished.push(request))
  },

  listenForFailed(page: Page) {
    this.failed = []
    this._replaceListener(page, 'requestfailed', (request: Request) => this.failed.push(request))
  },

  listenForResponses(page: Page) {
    this.responses = []
    this._replaceListener(page, 'response', (data: Response) => this.responses.push(data))
  },
}

export const shouldBeDumpPage = async (page: Page, method: 'get' | 'post' | 'patch' | 'put' | 'delete') => {
  await expect(page).toHaveURL(new RegExp(`dump/${method}`))
  // Wait for Vue/React/Svelte to mount and set the dump (Firefox may need this)
  await page.waitForFunction(() => window._inertia_request_dump !== undefined)
  // @ts-ignore
  const dump = await page.evaluate(() => window._inertia_request_dump)

  return dump
}

export const scrollElementTo = async (page: Page, promise: Promise<void>) => {
  await promise
  // Wait for scroll listener debounce
  await page.waitForTimeout(100)
}

export const gotoPageAndWaitForContent = async (page: Page, url: string) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
}

export const reloadAndWaitForContent = async (page: Page) => {
  await page.reload({ waitUntil: 'domcontentloaded' })
}

// Wait for scroll to complete after navigating to a fragment
export const waitForFragmentScroll = async (page: Page) => {
  // Give time for the scroll animation to complete
  await page.waitForTimeout(200)
}

export const clientOnlyProbe = {
  async reset(page: Page) {
    await page.evaluate(() => {
      window._inertia_client_only_fallback_renders = 0
      window._inertia_client_only_child_mounts = 0
    })
  },

  async fallbackRenders(page: Page) {
    return page.evaluate(() => window._inertia_client_only_fallback_renders)
  },

  async childMounts(page: Page) {
    return page.evaluate(() => window._inertia_client_only_child_mounts)
  },

  // Asserts the ClientOnly content is showing, the fallback is gone from the DOM, and
  // the fallback was rendered exactly `expectedFallbackRenders` times (0 unless this is
  // the genuine SSR hydration pass, where it's rendered exactly once).
  async expectRendered(page: Page, expectedText: string, expectedFallbackRenders = 0) {
    await expect(page.getByTestId('client-only-content')).toHaveText(expectedText)
    await expect(page.getByTestId('client-only-fallback')).toHaveCount(0)
    expect(await this.fallbackRenders(page)).toBe(expectedFallbackRenders)
  },
}

// Clicks a link that navigates away, waits for the destination to actually land, then
// goes back -- waiting first avoids racing goBack() against the pending visit, which
// can confuse the resulting history state.
export const clickLinkAndGoBack = async (
  page: Page,
  linkTestId: string,
  waitForDestination: () => Promise<unknown>,
) => {
  await page.getByTestId(linkTestId).click()
  await waitForDestination()
  await page.goBack()
}
