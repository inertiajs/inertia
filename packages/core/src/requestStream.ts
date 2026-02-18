import { Request } from './request'

export class RequestStream {
  protected requests: Request[] = []

  protected maxConcurrent: number

  protected interruptible: boolean

  constructor({ maxConcurrent, interruptible }: { maxConcurrent: number; interruptible: boolean }) {
    this.maxConcurrent = maxConcurrent
    this.interruptible = interruptible
  }

  public send(request: Request) {
    this.requests.push(request)

    request.send().then(() => {
      this.requests = this.requests.filter((r) => r !== request)
    })
  }

  public interruptInFlight(): void {
    this.cancel({ interrupted: true }, false)
  }

  public hasPendingOptimistic(): boolean {
    return this.requests.some((request) => request.isPendingOptimistic())
  }

  public cancelInFlight({ prefetch = true, optimistic = true } = {}): void {
    this.requests
      .filter((request) => prefetch || !request.isPrefetch())
      .filter((request) => optimistic || !request.isOptimistic())
      .forEach((request) => request.cancel({ cancelled: true }))
  }

  protected cancel({ cancelled = false, interrupted = false } = {}, force: boolean = false): void {
    if (!force && !this.shouldCancel()) {
      return
    }

    const request = this.requests.shift()!

    request?.cancel({ cancelled, interrupted })
  }

  protected shouldCancel(): boolean {
    return this.interruptible && this.requests.length >= this.maxConcurrent
  }
}
