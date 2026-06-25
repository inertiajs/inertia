import { beforeEach, describe, expect, it, vi } from 'vitest'
import { interceptors } from '../src/interceptors'
import type { HttpRequestConfig, HttpResponse, InternalActiveVisit } from '../src/types'

const makeVisit = (overrides: Partial<InternalActiveVisit> = {}): InternalActiveVisit =>
  ({ id: 'visit-1', ...overrides }) as InternalActiveVisit

const makeRequest = (overrides: Partial<HttpRequestConfig> = {}): HttpRequestConfig =>
  ({ method: 'get', url: '/users', headers: {}, ...overrides }) as HttpRequestConfig

const makeResponse = (overrides: Partial<HttpResponse> = {}): HttpResponse =>
  ({ status: 200, data: '', headers: {}, ...overrides }) as HttpResponse

describe('interceptors', () => {
  let unsubscribes: VoidFunction[] = []

  beforeEach(() => {
    unsubscribes.forEach((unsubscribe) => unsubscribe())
    unsubscribes = []
  })

  function track(unsubscribe: VoidFunction): VoidFunction {
    unsubscribes.push(unsubscribe)

    return unsubscribe
  }

  describe('request interceptors', () => {
    it('runs registered handlers with the visit and request config', async () => {
      const handler = vi.fn((_visit, config) => config)
      track(interceptors.onVisitRequest(handler))

      const visit = makeVisit()
      const config = makeRequest()
      await interceptors.processRequest(visit, config)

      expect(handler).toHaveBeenCalledWith(visit, config)
    })

    it('lets a handler transform the outgoing headers and data', async () => {
      track(
        interceptors.onVisitRequest((visit, config) => ({
          ...config,
          headers: { ...config.headers, 'X-Visit': visit.id },
          data: { mutated: true },
        })),
      )

      const result = await interceptors.processRequest(makeVisit({ id: 'abc' }), makeRequest())

      expect(result.headers).toMatchObject({ 'X-Visit': 'abc' })
      expect(result.data).toEqual({ mutated: true })
    })

    it('pipes the result of each handler into the next, in registration order', async () => {
      track(interceptors.onVisitRequest((_visit, config) => ({ ...config, url: `${config.url}/a` })))
      track(interceptors.onVisitRequest((_visit, config) => ({ ...config, url: `${config.url}/b` })))

      const result = await interceptors.processRequest(makeVisit(), makeRequest({ url: '/users' }))

      expect(result.url).toBe('/users/a/b')
    })

    it('awaits async handlers', async () => {
      track(
        interceptors.onVisitRequest(async (_visit, config) => ({
          ...config,
          headers: { ...config.headers, 'X-Async': 'yes' },
        })),
      )

      const result = await interceptors.processRequest(makeVisit(), makeRequest())

      expect(result.headers).toMatchObject({ 'X-Async': 'yes' })
    })

    it('stops calling a handler once it is unsubscribed', async () => {
      const handler = vi.fn((_visit, config) => config)
      const unsubscribe = interceptors.onVisitRequest(handler)

      await interceptors.processRequest(makeVisit(), makeRequest())
      unsubscribe()
      await interceptors.processRequest(makeVisit(), makeRequest())

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('response interceptors', () => {
    it('runs registered handlers with the visit and response', async () => {
      const handler = vi.fn((_visit, response) => response)
      track(interceptors.onVisitResponse(handler))

      const visit = makeVisit()
      const response = makeResponse({ headers: { 'x-foo': 'bar' } })
      await interceptors.processResponse(visit, response)

      expect(handler).toHaveBeenCalledWith(visit, response)
    })

    it('pipes the result of each handler into the next', async () => {
      track(interceptors.onVisitResponse((_visit, response) => ({ ...response, status: response.status + 1 })))
      track(interceptors.onVisitResponse((_visit, response) => ({ ...response, status: response.status + 1 })))

      const result = await interceptors.processResponse(makeVisit(), makeResponse({ status: 200 }))

      expect(result.status).toBe(202)
    })

    it('stops calling a handler once it is unsubscribed', async () => {
      const handler = vi.fn((_visit, response) => response)
      const unsubscribe = interceptors.onVisitResponse(handler)

      await interceptors.processResponse(makeVisit(), makeResponse())
      unsubscribe()
      await interceptors.processResponse(makeVisit(), makeResponse())

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
