import type { EchoInstanceLike } from '@inertiajs/core/echo'
import { EventFormatter } from 'laravel-echo'

type EchoResolver = () => EchoInstanceLike

// A namespace is what makes the event formatter interesting: anything that
// doesn't start with a dot or a backslash gets prefixed with it
const NAMESPACE = 'App.Events'

type Listener = {
  event: string
  callback: CallableFunction
}

class FakeChannel {
  protected formatter = new EventFormatter(NAMESPACE)
  protected listeners: Listener[] = []

  constructor(
    public name: string,
    protected log: string[],
  ) {}

  public listen(event: string, callback: CallableFunction): this {
    const formatted = this.formatter.format(event)

    this.listeners.push({ event: formatted, callback })
    this.log.push(`listen ${this.name} ${formatted}`)

    return this
  }

  public stopListening(event: string, callback?: CallableFunction): this {
    const formatted = this.formatter.format(event)

    this.listeners = this.listeners.filter((listener) => {
      return listener.event !== formatted || (callback !== undefined && listener.callback !== callback)
    })

    this.log.push(`stopListening ${this.name} ${formatted}`)

    return this
  }

  public emit(event: string, payload: unknown): void {
    this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback(payload))
  }
}

class FakeEcho {
  public log: string[] = []

  protected channels = new Map<string, FakeChannel>()
  protected statusCallbacks = new Set<(status: string) => void>()

  public connector = {
    onConnectionChange: (callback: (status: string) => void): VoidFunction => {
      this.statusCallbacks.add(callback)

      return () => {
        this.statusCallbacks.delete(callback)
      }
    },
  }

  public channel(name: string): FakeChannel {
    return this.resolve(name)
  }

  public private(name: string): FakeChannel {
    return this.resolve(`private-${name}`)
  }

  public join(name: string): FakeChannel {
    return this.resolve(`presence-${name}`)
  }

  public encryptedPrivate(name: string): FakeChannel {
    return this.resolve(`private-encrypted-${name}`)
  }

  public leaveChannel(name: string): void {
    this.channels.delete(name)
    this.log.push(`leave ${name}`)
  }

  public socketId(): string {
    return 'echo-socket-id'
  }

  public emit(channel: string, event: string, payload: unknown): void {
    this.channels.get(channel)?.emit(event, payload)
  }

  public status(status: string): void {
    this.statusCallbacks.forEach((callback) => callback(status))
  }

  protected resolve(name: string): FakeChannel {
    if (!this.channels.has(name)) {
      this.channels.set(name, new FakeChannel(name, this.log))
      this.log.push(`join ${name}`)
    }

    return this.channels.get(name)!
  }
}

let instance = new FakeEcho()

if (typeof window !== 'undefined') {
  window.__inertiaEcho = {
    emit: (channel, event, payload = null) => instance.emit(channel, event, payload),
    status: (status) => instance.status(status),
    log: () => [...instance.log],

    // `configureEcho()` throws the previous instance away and builds a new one,
    // connector included, so anything holding the old connector goes deaf
    swap: () => {
      instance = new FakeEcho()
    },
  }
}

export const resolveFakeEcho: EchoResolver = () => instance as unknown as EchoInstanceLike
