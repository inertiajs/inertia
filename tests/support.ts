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

  listen(page: Page) {
    this.requests = []
    page.on('request', (request) => this.requests.push(request))
  },

  listenForFinished(page: Page) {
    this.finished = []
    page.on('requestfinished', (request) => this.finished.push(request))
  },

  listenForFailed(page: Page) {
    this.failed = []
    page.on('requestfailed', (request) => this.failed.push(request))
  },

  listenForResponses(page: Page) {
    this.responses = []
    page.on('response', (data) => this.responses.push(data))
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
