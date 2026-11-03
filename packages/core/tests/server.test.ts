import * as http from 'http'
import { type AddressInfo, connect } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import createSSRServer from '../src/server'

const servers: http.Server[] = []
const unhandledRejection = vi.fn()

const startServer = async (render: Parameters<typeof createSSRServer>[0]) => {
  const listen = http.Server.prototype.listen

  vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (this: http.Server, ...args) {
    servers.push(this)

    return listen.apply(this, args as Parameters<typeof listen>)
  })

  createSSRServer(render, { port: 0, host: '127.0.0.1' })

  const server = servers[servers.length - 1]

  if (!server.listening) {
    await new Promise((resolve) => server.once('listening', resolve))
  }

  return { server, port: (server.address() as AddressInfo).port }
}

describe('SSR Server', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    process.off('unhandledRejection', unhandledRejection)
    unhandledRejection.mockClear()

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
    const render = vi.fn(() => Promise.resolve({ body: '', head: [] }))
    const { port } = await startServer(render)

    const response = await fetch(`http://127.0.0.1:${port}/render`, init)
    const health = await fetch(`http://127.0.0.1:${port}/health`)

    expect(response.status).toBe(400)
    expect(render).not.toHaveBeenCalled()
    expect(health.status).toBe(200)
  })

  it('handles a client that aborts while sending the page', async () => {
    const render = vi.fn(() => Promise.resolve({ body: '', head: [] }))
    const { server, port } = await startServer(render)

    process.on('unhandledRejection', unhandledRejection)

    const requestReceived = new Promise<http.IncomingMessage>((resolve) => server.once('request', resolve))
    const socket = connect(port, '127.0.0.1')

    socket.write(
      'POST /render HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/json\r\nContent-Length: 4096\r\n\r\n{"component":',
    )

    const request = await requestReceived
    const requestClosed = new Promise((resolve) => request.once('close', resolve))

    socket.destroy()
    await requestClosed

    // Give the rejected handler a tick to surface as an unhandled rejection
    await new Promise((resolve) => setImmediate(resolve))

    const health = await fetch(`http://127.0.0.1:${port}/health`)

    expect(unhandledRejection).not.toHaveBeenCalled()
    expect(render).not.toHaveBeenCalled()
    expect(health.status).toBe(200)
  })
})
