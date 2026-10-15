import * as http from 'http'
import * as net from 'net'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest'
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

  // The adapter can disconnect while it is still sending the page, for
  // instance when its process is killed: the request stream then errors.
  it('handles a client that aborts while sending the page', async () => {
    captureListeningServers()
    const render = vi.fn(() => Promise.resolve({ body: '', head: [] }))
    const unhandledRejection = vi.fn()
    process.on('unhandledRejection', unhandledRejection)
    onTestFinished(() => {
      process.off('unhandledRejection', unhandledRejection)
    })

    createSSRServer(render, { port: 0, host: '127.0.0.1' })
    await listening(servers[0])
    const port = (servers[0].address() as AddressInfo).port
    const requestReceived = new Promise<http.IncomingMessage>((resolve) => servers[0].once('request', resolve))

    const socket = net.connect(port, '127.0.0.1')
    socket.write(
      'POST /render HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/json\r\nContent-Length: 4096\r\n\r\n{"component":',
    )
    const request = await requestReceived
    const requestClosed = new Promise((resolve) => request.once('close', resolve))
    socket.destroy()
    await requestClosed
    await new Promise((resolve) => setImmediate(resolve))

    const health = await fetch(`http://127.0.0.1:${port}/health`)

    expect(unhandledRejection).not.toHaveBeenCalled()
    expect(render).not.toHaveBeenCalled()
    expect(health.status).toBe(200)
  })
})
