import { beforeEach, expect, expectTypeOf, suite, test, vi } from 'vitest'
import * as events from '../src/events'
import { History } from '../src/history'
import { navigationType } from '../src/navigationType'
import { page } from '../src/page'
import { Request } from '../src/request'
import { Router } from '../src/router'
import { Scroll } from '../src/scroll'
import { SessionStorage } from '../src/sessionStorage'
import { FormDataConvertible } from '../src/types'
import { homePage } from './support'

beforeEach(() => {
  vi.useFakeTimers()
})

expect.extend({
  dataToBeFormData(received, _expected) {
    const { isNot } = this

    return {
      pass: typeof received === 'object' && received.data instanceof FormData,
      message: () => `data is${isNot ? ' not' : ''} instance of FormData`,
    }
  },
  dataToBeFormDataConvertible(received, _expected) {
    const { isNot } = this

    return {
      pass: typeof received === 'object' && expectTypeOf(received.data).toMatchTypeOf<FormDataConvertible>(),
      message: () => `data is${isNot ? ' not' : ''} instance of FormData`,
    }
  },
})

const getRouter = (cb?: (router: Router) => void) => {
  const router = new Router()

  if (cb) {
    cb(router)
  }

  router.init({
    initialPage: homePage,
    resolveComponent: () => {},
    swapComponent: () => {
      return Promise.resolve({
        component: 'home',
        props: {
          errors: {},
        },
        url: '/',
        version: '1',
        scrollRegions: [],
        rememberedState: {},
      })
    },
  })

  return router
}

suite('init', () => {
  test('clear remembered state on navigation type reload', () => {
    const navTypeSpy = vi.spyOn(navigationType, 'isReload').mockReturnValue(true)
    const historySpy = vi.spyOn(History, 'deleteState').mockReturnValue()

    getRouter()

    expect(navTypeSpy).toHaveBeenCalledOnce()
    expect(historySpy).toHaveBeenCalledWith('rememberedState')
  })

  test('will not clear remembered state when navigation type is not reload', () => {
    const navTypeSpy = vi.spyOn(navigationType, 'isReload').mockReturnValue(false)
    const historySpy = vi.spyOn(History, 'deleteState').mockReturnValue()

    getRouter()

    expect(navTypeSpy).toHaveBeenCalledOnce()
    expect(historySpy).not.toHaveBeenCalled()
  })

  test('handle back forward visit', async () => {
    const navTypeSpy = vi.spyOn(navigationType, 'isBackForward').mockReturnValue(true)
    const historySpies = {
      hasAnyState: vi.spyOn(History, 'hasAnyState').mockReturnValue(true),
      setState: vi.spyOn(History, 'setState').mockReturnValue(),
      getAllState: vi.spyOn(History, 'getAllState').mockReturnValue({
        myState: 'is here',
      }),
    }
    const pageSpy = vi.spyOn(page, 'set').mockResolvedValue()
    const scrollRestoreSpy = vi.spyOn(Scroll, 'restore').mockReturnValue()
    const fireNavigateEventSpy = vi.spyOn(events, 'fireNavigateEvent').mockReturnValue()

    getRouter()

    await vi.runAllTimersAsync()

    expect(navTypeSpy).toHaveBeenCalledOnce()

    expect(historySpies.hasAnyState).toHaveBeenCalledOnce()
    expect(historySpies.setState).toHaveBeenCalledOnce()
    expect(historySpies.setState).toHaveBeenCalledWith('version', '1')
    expect(historySpies.getAllState).toHaveBeenCalledOnce()

    expect(pageSpy).toHaveBeenCalledOnce()
    expect(pageSpy).toHaveBeenCalledWith({ myState: 'is here' }, { preserveScroll: true, preserveState: true })

    expect(scrollRestoreSpy).toHaveBeenCalledOnce()
    expect(scrollRestoreSpy).toHaveBeenCalledWith(homePage)

    expect(fireNavigateEventSpy).toHaveBeenCalledOnce()
    expect(fireNavigateEventSpy).toHaveBeenCalledWith(homePage)
  })

  test.each([
    { preserveScroll: true, shouldBeCalled: 1 },
    { preserveScroll: false, shouldBeCalled: 0 },
  ])(
    'handle location visit with preserve scroll equal to $preserveScroll',
    async ({ preserveScroll, shouldBeCalled }) => {
      const sessionStorageSpies = {
        exists: vi.spyOn(SessionStorage, 'exists').mockReturnValue(true),
        get: vi.spyOn(SessionStorage, 'get').mockReturnValue(
          JSON.stringify({
            preserveScroll,
          }),
        ),
        remove: vi.spyOn(SessionStorage, 'remove').mockReturnValue(),
      }

      const pageSpies = {
        setUrlHash: vi.spyOn(page, 'setUrlHash').mockReturnValue(),
        remember: vi.spyOn(page, 'remember').mockResolvedValue(),
        scrollRegions: vi.spyOn(page, 'scrollRegions').mockResolvedValue(),
        set: vi.spyOn(page, 'set').mockResolvedValue(),
      }

      const historySpies = {
        getState: vi.spyOn(History, 'getState').mockReturnValue({}),
      }

      const scrollSpy = {
        restore: vi.spyOn(Scroll, 'restore').mockReturnValue(),
      }

      const fireNavigateEventSpy = vi.spyOn(events, 'fireNavigateEvent').mockReturnValue()

      getRouter()

      await vi.runAllTimersAsync()

      expect(sessionStorageSpies.exists).toHaveBeenCalledOnce()
      expect(sessionStorageSpies.get).toHaveBeenCalledOnce()
      expect(sessionStorageSpies.remove).toHaveBeenCalledOnce()

      expect(historySpies.getState).toHaveBeenCalledTimes(2)
      expect(historySpies.getState).toHaveBeenNthCalledWith(1, 'rememberedState', {})
      expect(historySpies.getState).toHaveBeenNthCalledWith(2, 'scrollRegions', [])

      expect(pageSpies.setUrlHash).toHaveBeenCalledOnce()
      expect(pageSpies.remember).toHaveBeenCalledOnce()
      expect(pageSpies.scrollRegions).toHaveBeenCalledOnce()
      expect(pageSpies.set).toHaveBeenCalledOnce()
      expect(pageSpies.set).toHaveBeenCalledWith(homePage, { preserveScroll, preserveState: true })

      expect(fireNavigateEventSpy).toHaveBeenCalledOnce()

      expect(scrollSpy.restore).toHaveBeenCalledTimes(shouldBeCalled)
    },
  )

  test('handle initial page visit', async () => {
    const pageSpies = {
      setUrlHash: vi.spyOn(page, 'setUrlHash').mockReturnValue(),
      set: vi.spyOn(page, 'set').mockResolvedValue(),
    }

    const fireNavigateEventSpy = vi.spyOn(events, 'fireNavigateEvent').mockReturnValue()

    getRouter()

    await vi.runAllTimersAsync()

    expect(pageSpies.setUrlHash).toHaveBeenCalledOnce()
    expect(pageSpies.set).toHaveBeenCalledOnce()
    expect(pageSpies.set).toHaveBeenCalledWith(homePage, { preserveState: true })

    expect(fireNavigateEventSpy).toHaveBeenCalledOnce()
  })

  test('it sets up listeners on init', { todo: true }, () => {
    // Listen for popstate
    // Listen for scroll (debounced)
  })

  test('handles popstate event when the state is null', { todo: true }, () => {
    const historySpy = vi.spyOn(History, 'replaceState').mockReturnValue()
    const scrollSpy = vi.spyOn(Scroll, 'reset').mockReturnValue()

    getRouter()

    // Might have to extract the handler to something we can call directly
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }))

    expect(historySpy).toHaveBeenCalledOnce()
    expect(scrollSpy).toHaveBeenCalledOnce()
    // If the state is null
    //  - re-construct the url from the current page + window hash
    //  - replace the history state with the current page + full url
    //  - reset scroll positions
    // Otherwise
    //  - get the page from the state
    //  - resolve the component
    //  - swap the component
    //  - restore scroll positions
    //  - fire navigate event
  })

  test('handles scroll event', { todo: true }, async () => {
    const scrollSpy = vi.spyOn(Scroll, 'onScroll').mockReturnValue()

    getRouter()

    // If the current page has scroll regions, save the scroll position
    window.dispatchEvent(new CustomEvent('scroll'))

    await vi.runAllTimersAsync()

    expect(scrollSpy).toHaveBeenCalledOnce()
  })
})

suite('visit', () => {
  test('it can cancel a visit', async () => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
      cancel: vi.spyOn(Request.prototype, 'cancel').mockReturnValue(),
    }

    const router = getRouter()

    router.visit('/home')
    router.cancel()

    await vi.runAllTimersAsync()

    expect(requestSpies.create).toHaveBeenCalledOnce()
    expect(requestSpies.send).toHaveBeenCalledOnce()
    expect(requestSpies.cancel).toHaveBeenCalledOnce()
    expect(requestSpies.cancel).toHaveBeenCalledWith({ cancelled: true, interrupted: false })
  })

  test.each([
    { url: '/home', expectedUrl: new URL('/home', 'http://localhost:3000') },
    { url: new URL('/home', 'http://localhost'), expectedUrl: new URL('/home', 'http://localhost') },
  ])('it can make a visit with either a string url or URL object', { todo: true }, async ({ url, expectedUrl }) => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
    }

    const router = getRouter()

    router.visit(url)

    await vi.runAllTimersAsync()

    expect(requestSpies.create).toHaveBeenCalledOnce()
    expect(requestSpies.create).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expectedUrl,
      }),
    )
  })

  test.each([
    {
      from: 'file',
      to: 'FormData',
      params: {
        data: {
          file: new File([''], 'file.txt'),
        },
      },
      // @ts-ignore
      expectation: () => expect.dataToBeFormData(),
    },
    {
      from: 'force',
      to: 'FormData',
      params: {
        data: {
          whatever: 'ok',
        },
        forceFormData: true,
      },
      // @ts-ignore
      expectation: () => expect.dataToBeFormData(),
    },
    {
      from: 'object',
      to: 'FormDataConvertible',
      params: {
        data: {
          whatever: 'ok',
        },
      },
      // @ts-ignore
      expectation: () => expect.dataToBeFormDataConvertible(),
    },
  ])('it can transform incoming data from $from to $to', { todo: true }, async ({ params, expectation }) => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
    }

    const router = getRouter()

    router.visit('/home', params)

    await vi.runAllTimersAsync()

    expect(requestSpies.create).toHaveBeenCalledOnce()
    expect(requestSpies.create).toHaveBeenCalledWith(expectation())
    // TODO: Also check that the url has changed?
  })

  test('abort a request by returning false from the onBefore callback', async () => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
    }

    const router = getRouter()

    router.visit('/home', {
      onBefore() {
        return false
      },
    })

    await vi.runAllTimersAsync()

    expect(requestSpies.create).not.toHaveBeenCalled()
    expect(requestSpies.send).not.toHaveBeenCalled()
  })

  test('abort a request by returning false from the global before callback', async () => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
    }

    const router = getRouter()

    const stopListening = router.on('before', () => false)

    router.visit('/home')

    await vi.runAllTimersAsync()

    stopListening()

    expect(requestSpies.create).not.toHaveBeenCalled()
    expect(requestSpies.send).not.toHaveBeenCalled()
  })

  test('cancel an inflight request if another comes in', async () => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
      cancel: vi.spyOn(Request.prototype, 'cancel').mockReturnValue(),
    }

    const router = getRouter()

    router.visit('/home')
    router.visit('/about')

    await vi.runAllTimersAsync()

    expect(requestSpies.create).toHaveBeenCalledTimes(2)
    expect(requestSpies.cancel).toHaveBeenCalledOnce()
    expect(requestSpies.cancel).toHaveBeenCalledWith({ interrupted: true, cancelled: false })
  })

  test('save scroll positions when we start a request', async () => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
    }

    // TODO: This calls "reset()"... is that correct?
    // There's a double "save" call when this isn't present
    const pageSpies = {
      set: vi.spyOn(page, 'set').mockResolvedValue(),
    }

    const scrollSpy = vi.spyOn(Scroll, 'save').mockReturnValue()

    const router = getRouter()

    router.visit('/home')

    await vi.runAllTimersAsync()

    expect(scrollSpy).toHaveBeenCalledOnce()
    expect(scrollSpy).toHaveBeenCalledWith(homePage)
    expect(pageSpies.set).toHaveBeenCalledOnce()
    expect(requestSpies.create).toHaveBeenCalledOnce()
    expect(requestSpies.send).toHaveBeenCalledOnce()
  })

  test('verify that request params are passed to the request', { todo: true }, async () => {
    const requestSpies = {
      create: vi.spyOn(Request, 'create'),
      send: vi.spyOn(Request.prototype, 'send').mockResolvedValue(),
    }

    const router = getRouter()

    router.visit('/home', {
      method: 'post',
      data: {
        name: 'John Doe',
      },
      headers: {
        'X-My-Header': 'my-value',
      },
    })

    await vi.runAllTimersAsync()

    expect(requestSpies.create).toHaveBeenCalledOnce()
    expect(requestSpies.create).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        data: { name: 'John Doe' },
        headers: {
          'X-My-Header': 'my-value',
        },
      }),
    )
  })

  test('get helper', () => {
    const router = getRouter()

    const visitSpy = vi.spyOn(router, 'visit').mockReturnValue()

    const data = {
      name: 'Joe',
    }

    const options = {
      only: ['name'],
    }

    router.get('/home', data, options)

    expect(visitSpy).toHaveBeenCalledOnce()
    expect(visitSpy).toHaveBeenCalledWith('/home', { ...options, method: 'get', data })
  })

  test('post helper', () => {
    const router = getRouter()

    const visitSpy = vi.spyOn(router, 'visit').mockReturnValue()

    const data = {
      name: 'Joe',
    }

    const options = {
      only: ['name'],
    }

    router.post('/home', data, options)

    expect(visitSpy).toHaveBeenCalledOnce()
    expect(visitSpy).toHaveBeenCalledWith('/home', {
      ...options,
      preserveState: true,
      method: 'post',
      data,
    })
  })

  test('put helper', () => {
    const router = getRouter()

    const visitSpy = vi.spyOn(router, 'visit').mockReturnValue()

    const data = {
      name: 'Joe',
    }

    const options = {
      only: ['name'],
    }

    router.put('/home', data, options)

    expect(visitSpy).toHaveBeenCalledOnce()
    expect(visitSpy).toHaveBeenCalledWith('/home', {
      ...options,
      preserveState: true,
      method: 'put',
      data,
    })
  })

  test('patch helper', () => {
    const router = getRouter()

    const visitSpy = vi.spyOn(router, 'visit').mockReturnValue()

    const data = {
      name: 'Joe',
    }

    const options = {
      only: ['name'],
    }

    router.patch('/home', data, options)

    expect(visitSpy).toHaveBeenCalledOnce()
    expect(visitSpy).toHaveBeenCalledWith('/home', {
      ...options,
      preserveState: true,
      method: 'patch',
      data,
    })
  })

  test('delete helper', () => {
    const router = getRouter()

    const visitSpy = vi.spyOn(router, 'visit').mockReturnValue()

    const options = {
      only: ['name'],
    }

    router.delete('/home', options)

    expect(visitSpy).toHaveBeenCalledOnce()
    expect(visitSpy).toHaveBeenCalledWith('/home', {
      ...options,
      preserveState: true,
      method: 'delete',
    })
  })

  test('reload helper', () => {
    const router = getRouter()

    const visitSpy = vi.spyOn(router, 'visit').mockReturnValue()

    const options = {
      only: ['name'],
    }

    router.reload(options)

    expect(visitSpy).toHaveBeenCalledOnce()
    expect(visitSpy).toHaveBeenCalledWith('http://localhost:3000/', {
      ...options,
      async: true,
      preserveState: true,
      preserveScroll: true,
    })
  })

  test.each([
    {
      label: 'default key',
      key: undefined,
      expectedKey: 'default',
    },
    {
      label: 'custom key',
      key: 'myKey',
      expectedKey: 'myKey',
    },
  ])('we can remember state with $label', ({ key, expectedKey }) => {
    const historySpies = {
      remember: vi.spyOn(History, 'remember').mockReturnValue(),
    }

    const router = getRouter()

    router.remember({ name: 'Joe' }, key)

    expect(historySpies.remember).toHaveBeenCalledOnce()
    expect(historySpies.remember).toHaveBeenCalledWith({ name: 'Joe' }, expectedKey)
  })

  test.each([
    {
      label: 'default key',
      key: undefined,
      expectedKey: 'default',
    },
    {
      label: 'custom key',
      key: 'myKey',
      expectedKey: 'myKey',
    },
  ])('we can restore state with $label', ({ key, expectedKey }) => {
    const historySpies = {
      restore: vi.spyOn(History, 'restore').mockReturnValue(null),
    }

    const router = getRouter()

    router.restore(key)

    expect(historySpies.restore).toHaveBeenCalledOnce()
    expect(historySpies.restore).toHaveBeenCalledWith(expectedKey)
  })

  test('we can listen for global events', { todo: true }, () => {
    // if event is cancelable and callback returns false, cancel the event
  })
})
