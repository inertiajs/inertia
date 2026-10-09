import * as http from 'http'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import createSSRServer from '../src/server'

const servers: http.Server[] = []

const captureListeningServers = () => {
  const listen = http.Server.prototype.listen

  vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (this: http.Server, ...args) {
    servers.push(this)

    return listen.apply(this, args as Parameters<typeof listen>)
  })
}

const listening = (server: http.Server) =>
  new Promise<void>((resolve) => (server.listening ? resolve() : server.once('listening', () => resolve())))

describe('SSR Server', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await Promise.all(
      servers.splice(0).map((server) => {
        server.closeAllConnections()

        return new Promise((resolve) => server.close(resolve))
      }),
    )
  })

  it('forwards the host option to listen', () => {
    const listenSpy = vi.spyOn(http.Server.prototype, 'listen').mockReturnThis()

    createSSRServer(() => Promise.resolve({ body: '', head: [] }), { port: 19990, host: '127.0.0.1' })

    expect(listenSpy).toHaveBeenCalledWith({ port: 19990, host: '127.0.0.1' }, expect.any(Function))
  })

  it.each([
    ['a GET request without a body', { method: 'GET' }],
    ['a body that is not JSON', { method: 'POST', body: 'not json' }],
  ])('rejects %s on /render and keeps serving', async (_, init) => {
    captureListeningServers()
    const render = vi.fn(() => Promise.resolve({ body: '', head: [] }))

    createSSRServer(render, { port: 0, host: '127.0.0.1' })
    await listening(servers[0])
    const url = `http://127.0.0.1:${(servers[0].address() as AddressInfo).port}`

    const response = await fetch(`${url}/render`, init)
    const health = await fetch(`${url}/health`)

    expect(response.status).toBe(400)
    expect(render).not.toHaveBeenCalled()
    expect(health.status).toBe(200)
  })
})
