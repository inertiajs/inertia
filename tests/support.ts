import { expect, Page, Request } from '@playwright/test'

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
    this.maxLoads = maxLoads

    page.on('load', () => {
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
  await expect(page).toHaveURL(`dump/${method}`)
  // @ts-ignore
  const dump = await page.evaluate(() => window._inertia_request_dump)
  await expect(dump).not.toBeNull()

  return dump
}

export const scrollElementTo = async (page: Page, promise: Promise<void>) => {
  await promise
  // Wait for scroll listener debounce
  await page.waitForTimeout(100)
}
