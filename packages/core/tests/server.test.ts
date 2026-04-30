import * as http from 'http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import createSSRServer from '../src/server'

describe('SSR Server', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards the host option to listen', () => {
    const listenSpy = vi.spyOn(http.Server.prototype, 'listen').mockReturnThis()

    createSSRServer(() => Promise.resolve({ body: '', head: [] }), { port: 19990, host: '127.0.0.1' })

    expect(listenSpy).toHaveBeenCalledWith({ port: 19990, host: '127.0.0.1' }, expect.any(Function))
  })
})
