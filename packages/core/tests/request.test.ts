import axios from 'axios'
import { beforeEach, expect, test, vi } from 'vitest'
import * as events from '../src/events'
import { page } from '../src/page'
import { Request } from '../src/request'
import { Response } from '../src/response'
import { axiosResponse, getRequestParams, homePage } from './support'

beforeEach(() => {
  vi.useFakeTimers()

  page.init({
    initialPage: homePage,
    resolveComponent: async (component) => component,
    swapComponent: async ({ component }) => component,
  })
})

vi.mock('axios')

const axiosMock = vi.mocked(axios)

test('create a request from the helper method', () => {
  const request = Request.create(getRequestParams(), page.get())

  expect(request).toBeInstanceOf(Request)
})

test('sending the correct headers for partial requests', async () => {
  axiosMock.mockResolvedValue(axiosResponse())
  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  const request = Request.create(getRequestParams({ only: ['foo', 'bar'] }), page.get())

  await request.send()

  expect(axios).toHaveBeenCalledWith({
    method: 'get',
    url: 'http://localhost:3000/',
    data: {},
    headers: {
      Accept: 'text/html, application/xhtml+xml',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Inertia': true,
      'X-Inertia-Version': '1',
      'X-Inertia-Partial-Component': 'Home',
      'X-Inertia-Partial-Data': 'foo,bar',
    },
    onUploadProgress: expect.any(Function),
    params: {},
    signal: expect.any(Object),
  })

  expect(responseHandleSpy).toHaveBeenCalledOnce()
})

test('including inertia version request header', async () => {
  await page.set({
    ...homePage,
    version: '2',
  })

  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  axiosMock.mockResolvedValue(axiosResponse())

  const request = Request.create(getRequestParams(), page.get())

  await request.send()

  expect(axios).toHaveBeenCalledWith({
    method: 'get',
    url: 'http://localhost:3000/',
    data: {},
    headers: {
      Accept: 'text/html, application/xhtml+xml',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Inertia': true,
      'X-Inertia-Version': '2',
    },
    onUploadProgress: expect.any(Function),
    params: {},
    signal: expect.any(Object),
  })

  expect(responseHandleSpy).toHaveBeenCalledOnce()
})

test('including the error bag in request header', async () => {
  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  axiosMock.mockResolvedValue(axiosResponse())

  const request = Request.create(
    getRequestParams({
      errorBag: 'error-tho',
    }),
    page.get(),
  )

  await request.send()

  expect(axios).toHaveBeenCalledWith({
    method: 'get',
    url: 'http://localhost:3000/',
    data: {},
    headers: {
      Accept: 'text/html, application/xhtml+xml',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Inertia': true,
      'X-Inertia-Version': '1',
      'X-Inertia-Error-Bag': 'error-tho',
    },
    onUploadProgress: expect.any(Function),
    params: {},
    signal: expect.any(Object),
  })

  expect(responseHandleSpy).toHaveBeenCalledOnce()
})

test('firing on progress events', { todo: true }, async () => {
  // onProgress
  // global
})

test.each([
  {
    label: 'cancelling',
    cancelParams: {
      cancelled: true,
    },
    expectedFinal: {
      cancelled: true,
      interrupted: false,
      completed: false,
    },
  },
  {
    label: 'interrupting',
    cancelParams: {
      interrupted: true,
    },
    expectedFinal: {
      cancelled: false,
      interrupted: true,
      completed: false,
    },
  },
])('$label a request', async ({ cancelParams, expectedFinal }) => {
  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
  const fireFinishEventsSpy = vi.spyOn(events, 'fireFinishEvent').mockReturnValue()
  const fireStartEventsSpy = vi.spyOn(events, 'fireStartEvent').mockReturnValue()
  const onCancel = vi.fn()
  const onFinish = vi.fn()
  const onStart = vi.fn()

  axiosMock.mockResolvedValue(axiosResponse())

  const requestParams = getRequestParams({
    onCancel,
    onFinish,
    onStart,
  })

  const request = Request.create(requestParams, page.get())

  request.send()
  request.cancel(cancelParams)

  await vi.runAllTimersAsync()

  expect(onCancel).toHaveBeenCalledOnce()
  expect(abortSpy).toHaveBeenCalledOnce()

  const finalParams = {
    ...requestParams,
    ...expectedFinal,
  }

  expect(fireFinishEventsSpy).toHaveBeenCalledOnce()
  expect(fireFinishEventsSpy).toHaveBeenCalledWith(finalParams)

  expect(fireStartEventsSpy).toHaveBeenCalledOnce()
  expect(fireStartEventsSpy).toHaveBeenCalledWith(finalParams)

  expect(onStart).toHaveBeenCalledOnce()
  expect(onStart).toHaveBeenCalledWith(finalParams)

  expect(onFinish).toHaveBeenCalledOnce()
  expect(onFinish).toHaveBeenCalledWith(finalParams)

  expect(responseHandleSpy).toHaveBeenCalledOnce()
})

test('errors with responses', async () => {
  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  const fireFinishEventsSpy = vi.spyOn(events, 'fireFinishEvent').mockReturnValue()
  const onFinish = vi.fn()

  axiosMock.mockRejectedValue({
    response: axiosResponse({
      status: 422,
    }),
  })

  const requestParams = getRequestParams({
    onFinish,
  })

  const request = Request.create(requestParams, page.get())

  await request.send()

  expect(fireFinishEventsSpy).toHaveBeenCalledOnce()
  expect(fireFinishEventsSpy).toHaveBeenCalledWith(requestParams)

  expect(onFinish).toHaveBeenCalledOnce()
  expect(onFinish).toHaveBeenCalledWith(requestParams)

  expect(responseHandleSpy).toHaveBeenCalledOnce()
})

test.each([
  {
    shouldThrow: true,
    label: 'should throw',
  },
  {
    shouldThrow: false,
    label: 'should not throw',
  },
])('handle generic errors and it $label', { todo: true }, async ({ shouldThrow }) => {
  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  const fireFinishEventsSpy = vi.spyOn(events, 'fireFinishEvent').mockReturnValue()
  const fireExceptionEventsSpy = vi.spyOn(events, 'fireExceptionEvent').mockReturnValue(shouldThrow)
  const onFinish = vi.fn()

  axiosMock.mockRejectedValue(null)

  const requestParams = getRequestParams({
    onFinish,
  })

  const request = Request.create(requestParams, page.get())

  //   if (!shouldThrow) {
  await expect(request.send()).rejects.toThrow()
  //   } else {
  //     await request.send()
  //   }

  expect(fireFinishEventsSpy).toHaveBeenCalledOnce()
  expect(fireFinishEventsSpy).toHaveBeenCalledWith(requestParams)

  expect(onFinish).toHaveBeenCalledOnce()
  expect(onFinish).toHaveBeenCalledWith(requestParams)

  expect(fireExceptionEventsSpy).toHaveBeenCalledOnce()

  expect(responseHandleSpy).not.toHaveBeenCalled()
})

test('request cancelled errors are handled gracefully', async () => {
  const responseHandleSpy = vi.spyOn(Response.prototype, 'handle').mockResolvedValue()

  const fireFinishEventsSpy = vi.spyOn(events, 'fireFinishEvent').mockReturnValue()
  const fireExceptionEventsSpy = vi.spyOn(events, 'fireExceptionEvent').mockReturnValue()
  const isCancelSpy = vi.spyOn(axios, 'isCancel').mockReturnValue(true)

  const onFinish = vi.fn()

  axiosMock.mockRejectedValue(null)

  const requestParams = getRequestParams({
    onFinish,
  })

  const request = Request.create(requestParams, page.get())

  await request.send()

  expect(fireFinishEventsSpy).toHaveBeenCalledOnce()
  expect(fireFinishEventsSpy).toHaveBeenCalledWith(requestParams)

  expect(onFinish).toHaveBeenCalledOnce()
  expect(onFinish).toHaveBeenCalledWith(requestParams)

  expect(fireExceptionEventsSpy).not.toHaveBeenCalled()

  expect(isCancelSpy).toHaveBeenCalledOnce()

  expect(responseHandleSpy).not.toHaveBeenCalled()
  expect(fireExceptionEventsSpy).not.toHaveBeenCalled()
})

test('it creates response objects for valid responses that are not 2xx', { todo: true }, async () => {})
