import { beforeEach, expect, test, vi } from 'vitest'
import { ActiveVisit, Page, PreserveStateOption } from '../src'
import * as events from '../src/events'
import { History } from '../src/history'
import modal from '../src/modal'
import { page as currentPage, page } from '../src/page'
import { RequestParams } from '../src/requestParams'
import { Response } from '../src/response'
import { SessionStorage } from '../src/sessionStorage'
import { axiosResponse, getRequestParams, homePage, pageComponent } from './support'

beforeEach(() => {
  vi.useFakeTimers()

  currentPage.init({
    initialPage: homePage,
    resolveComponent: async (component) => component,
    swapComponent: async ({ component }) => component,
  })
})

const requestParams = (overrides: Partial<ActiveVisit> = {}) => {
  return new RequestParams(getRequestParams(overrides))
}

test('create a response from the helper method', () => {
  const response = Response.create(requestParams(), axiosResponse(), page.get())

  expect(response).toBeInstanceOf(Response)
})

test('props are merged for partial request responses', async () => {
  await currentPage.set(
    pageComponent({
      props: {
        errors: {},
        existing: 'value',
      },
    }),
  )

  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const response = Response.create(
    requestParams({
      only: ['foo'],
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent({
        props: {
          errors: {},
          foo: 'bar',
        },
      }),
    }),
    page.get(),
  )

  await response.handle()

  expect(pageSpies.set).toHaveBeenCalledOnce()
  expect(pageSpies.set).toHaveBeenCalledWith(
    {
      ...homePage,
      props: {
        errors: {},
        existing: 'value',
        foo: 'bar',
      },
      url: 'http://localhost:3000/',
    },
    {
      preserveState: false,
      preserveScroll: false,
      replace: false,
    },
  )
})

test.each([
  {
    value: true,
    expected: true,
    label: 'true',
    responseProps: {},
  },
  {
    value: false,
    expected: false,
    label: 'false',
    responseProps: {},
  },
  {
    value: () => true,
    expected: true,
    label: 'function',
    responseProps: {},
  },
  {
    value: 'errors' as PreserveStateOption,
    expected: false,
    label: 'errors but none',
    responseProps: {},
  },
  {
    value: 'errors' as PreserveStateOption,
    expected: true,
    label: 'errors but present',
    // @ts-ignore
    responseProps: {
      props: {
        // TODO: Why is this type wrong...?
        errors: {
          foo: 'bar',
        },
      },
    } as Partial<Page>,
  },
])('preserve scroll option is respected after response [$label]', async ({ value, expected, responseProps }) => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const response = Response.create(
    requestParams({
      preserveScroll: value,
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent({ ...responseProps }),
    }),
    page.get(),
  )

  await response.handle()

  expect(pageSpies.set).toHaveBeenCalledOnce()
  expect(pageSpies.set).toHaveBeenCalledWith(
    {
      ...homePage,
      ...responseProps,
      url: 'http://localhost:3000/',
    },
    {
      preserveState: false,
      preserveScroll: expected,
      replace: false,
    },
  )
})

test.each([
  {
    value: true,
    expected: true,
    label: 'true',
    responseProps: {},
    historyStateCount: 1,
  },
  {
    value: false,
    expected: false,
    label: 'false',
    responseProps: {},
    historyStateCount: 0,
  },
  {
    value: () => true,
    expected: true,
    label: 'function',
    responseProps: {},
    historyStateCount: 1,
  },
  {
    value: 'errors' as PreserveStateOption,
    expected: false,
    label: 'errors but none',
    responseProps: {},
    historyStateCount: 1,
  },
  {
    value: 'errors' as PreserveStateOption,
    expected: true,
    label: 'errors but present',
    historyStateCount: 1,
    // @ts-ignore
    responseProps: {
      props: {
        // TODO: Why is this type wrong...?
        errors: {
          foo: 'bar',
        },
      },
    } as Partial<Page>,
  },
])(
  'preserve state option is respected after response [$label]',
  async ({ value, expected, responseProps, historyStateCount }) => {
    const pageSpies = {
      set: vi.spyOn(currentPage, 'set'),
    }

    const historyGetStateSpy = vi.spyOn(History, 'getState').mockReturnValue(false)

    const response = Response.create(
      requestParams({
        preserveState: value,
      }),
      axiosResponse({
        headers: {
          'x-inertia': 'true',
        },
        data: pageComponent({ ...responseProps }),
      }),
      page.get(),
    )

    await response.handle()

    expect(pageSpies.set).toHaveBeenCalledOnce()
    expect(pageSpies.set).toHaveBeenCalledWith(
      {
        ...homePage,
        ...responseProps,
        url: 'http://localhost:3000/',
      },
      {
        preserveState: expected,
        preserveScroll: false,
        replace: false,
      },
    )

    expect(historyGetStateSpy).toHaveBeenCalledTimes(historyStateCount)
  },
)

test('remembered state is set after response', async () => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const historyGetStateSpy = vi.spyOn(History, 'getState').mockReturnValue({
    customState: 'here it is',
  })

  const response = Response.create(
    requestParams({
      preserveState: true,
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent(),
    }),
    page.get(),
  )

  await response.handle()

  expect(pageSpies.set).toHaveBeenCalledOnce()
  expect(pageSpies.set).toHaveBeenCalledWith(
    {
      ...homePage,
      rememberedState: {
        customState: 'here it is',
      },
      url: 'http://localhost:3000/',
    },
    {
      preserveState: true,
      preserveScroll: false,
      replace: false,
    },
  )

  expect(historyGetStateSpy).toHaveBeenCalledTimes(2)
  expect(historyGetStateSpy).toHaveBeenCalledWith('rememberedState')
})

test('remembered state is not set if preserve state is false', async () => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const historyGetStateSpy = vi.spyOn(History, 'getState').mockReturnValue({
    customState: 'here it is',
  })

  const response = Response.create(
    requestParams({
      preserveState: false,
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent(),
    }),
    page.get(),
  )

  await response.handle()

  expect(pageSpies.set).toHaveBeenCalledOnce()
  expect(pageSpies.set).toHaveBeenCalledWith(
    {
      ...homePage,
      url: 'http://localhost:3000/',
    },
    {
      preserveState: false,
      preserveScroll: false,
      replace: false,
    },
  )

  expect(historyGetStateSpy).not.toHaveBeenCalled()
})

test('remembered state is not set if the response component is different', async () => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const historyGetStateSpy = vi.spyOn(History, 'getState').mockReturnValue({
    customState: 'here it is',
  })

  const response = Response.create(
    requestParams({
      preserveState: true,
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent({
        component: 'DifferentComponent',
      }),
    }),
    page.get(),
  )

  await response.handle()

  expect(pageSpies.set).toHaveBeenCalledOnce()
  expect(pageSpies.set).toHaveBeenCalledWith(
    {
      ...homePage,
      component: 'DifferentComponent',
      url: 'http://localhost:3000/',
    },
    {
      preserveState: true,
      preserveScroll: false,
      replace: false,
    },
  )

  expect(historyGetStateSpy).toHaveBeenCalledOnce()
  expect(historyGetStateSpy).toHaveBeenCalledWith('rememberedState')
})

test('preserve url hash if response url is the same', async () => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const testRequestParams = requestParams()

  testRequestParams.params.url.hash = '#test'

  const response = Response.create(
    testRequestParams,
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent(),
    }),
    page.get(),
  )

  await response.handle()

  expect(pageSpies.set).toHaveBeenCalledOnce()
  expect(pageSpies.set).toHaveBeenCalledWith(
    {
      ...homePage,
      url: 'http://localhost:3000/#test',
    },
    {
      preserveState: false,
      preserveScroll: false,
      replace: false,
    },
  )
})

test('if there are errors, fire error events', async () => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const fireErrorEventSpy = vi.spyOn(events, 'fireErrorEvent')
  const fireSuccessEventSpy = vi.spyOn(events, 'fireSuccessEvent')

  const onError = vi.fn()
  const onSuccess = vi.fn()

  const response = Response.create(
    requestParams({
      onError,
      onSuccess,
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent({
        props: {
          errors: {
            // TODO: Why is this type wrong...?
            // @ts-ignore
            foo: 'bar',
          },
        },
      }),
    }),
    page.get(),
  )

  await response.handle()

  expect(onError).toHaveBeenCalledOnce()
  expect(onError).toHaveBeenCalledWith({
    foo: 'bar',
  })

  expect(fireErrorEventSpy).toHaveBeenCalledOnce()
  expect(fireErrorEventSpy).toHaveBeenCalledWith({
    foo: 'bar',
  })

  expect(pageSpies.set).toHaveBeenCalledOnce()

  expect(onSuccess).not.toHaveBeenCalled()
  expect(fireSuccessEventSpy).not.toHaveBeenCalled()
})

test('if there are no errors, fire success events', async () => {
  const pageSpies = {
    set: vi.spyOn(currentPage, 'set'),
  }

  const fireSuccessEventSpy = vi.spyOn(events, 'fireSuccessEvent')
  const fireErrorEventSpy = vi.spyOn(events, 'fireErrorEvent')

  const onSuccess = vi.fn()
  const onError = vi.fn()

  const response = Response.create(
    requestParams({
      onSuccess,
      onError,
    }),
    axiosResponse({
      headers: {
        'x-inertia': 'true',
      },
      data: pageComponent(),
    }),
    page.get(),
  )

  await response.handle()

  const eventParams = {
    ...homePage,
    url: 'http://localhost:3000/',
  }

  expect(onSuccess).toHaveBeenCalledOnce()
  expect(onSuccess).toHaveBeenCalledWith(eventParams)

  expect(fireSuccessEventSpy).toHaveBeenCalledOnce()
  expect(fireSuccessEventSpy).toHaveBeenCalledWith(eventParams)

  expect(pageSpies.set).toHaveBeenCalledOnce()

  expect(onError).not.toHaveBeenCalled()
  expect(fireErrorEventSpy).not.toHaveBeenCalled()
})

test('handles location responses', async () => {
  const sessionStorageSpies = {
    setItem: vi.spyOn(SessionStorage, 'set').mockReturnValue(),
  }
  const windowReloadSpy = vi.spyOn(window.location, 'reload')

  const response = Response.create(
    requestParams(),
    axiosResponse({
      status: 409,
      headers: {
        'x-inertia-location': '/new-location',
      },
      data: pageComponent(),
    }),
    page.get(),
  )

  await response.handle()

  expect(sessionStorageSpies.setItem).toHaveBeenCalledOnce()
  expect(sessionStorageSpies.setItem).toHaveBeenCalledWith({ preserveScroll: false })

  expect(window.location.href).toBe('http://localhost:3000/new-location')
  expect(windowReloadSpy).not.toHaveBeenCalled()

  // Reset the internal state
  window.location.href = 'http://localhost:3000/'
})

test.each([
  {
    path: '/',
    expected: 'http://localhost:3000/',
    label: 'without hash',
  },
  {
    path: '/',
    expected: 'http://localhost:3000/#test',
    label: 'with hash',
  },
])('reloads when location destination is the same as current url $label', async ({ path, expected }) => {
  const sessionStorageSpies = {
    setItem: vi.spyOn(SessionStorage, 'set').mockReturnValue(),
  }

  window.location.href = expected

  const windowReloadSpy = vi.spyOn(window.location, 'reload')

  const response = Response.create(
    requestParams(),
    axiosResponse({
      status: 409,
      headers: {
        'x-inertia-location': path,
      },
      data: pageComponent(),
    }),
    page.get(),
  )

  await response.handle()

  expect(sessionStorageSpies.setItem).toHaveBeenCalledOnce()
  expect(sessionStorageSpies.setItem).toHaveBeenCalledWith({ preserveScroll: false })

  expect(window.location.href).toBe(expected)
  expect(windowReloadSpy).toHaveBeenCalledOnce()

  // Reset the internal state
  window.location.href = 'http://localhost:3000/'
})

test.each([
  {
    shouldFire: true,
    modalShowCount: 1,
  },
  {
    shouldFire: false,
    modalShowCount: 0,
  },
])('handles invalid responses (valid but not inertia)', async ({ shouldFire, modalShowCount }) => {
  const modalSpies = {
    show: vi.spyOn(modal, 'show').mockReturnValue(),
  }

  const fireInvalidEvent = vi.spyOn(events, 'fireInvalidEvent').mockReturnValue(shouldFire)

  const response = Response.create(
    requestParams(),
    axiosResponse({
      status: 200,
      headers: {},
      data: 'This is not an Inertia response',
    }),
    page.get(),
  )

  await response.handle()

  expect(modalSpies.show).toHaveBeenCalledTimes(modalShowCount)
  expect(fireInvalidEvent).toHaveBeenCalledOnce()
})

test('will continue to error if there is no response in the error object', { todo: true }, async () => {})

test('we return an on cancel token from the onCancel callback', { todo: true }, async () => {
  // https://inertiajs.com/manual-visits#visit-cancellation
})
