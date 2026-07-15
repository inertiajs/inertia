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

    request.send().finally(() => {
      this.requests = this.requests.filter((r) => r !== request)
    })
  }

  public interruptInFlight(): void {
    this.cancel({ interrupted: true }, false)
  }

  public cancelInFlight(
    options: { prefetch?: boolean; optimistic?: boolean } | ((request: Request) => boolean) = {},
  ): void {
    const shouldCancel =
      typeof options === 'function'
        ? options
        : (request: Request) => {
            const { prefetch = true, optimistic = true } = options

            return (prefetch || !request.isPrefetch()) && (optimistic || !request.isOptimistic())
          }

    this.requests.filter(shouldCancel).forEach((request) => request.cancel({ cancelled: true }))
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

  public hasPendingOptimistic(): boolean {
    return this.requests.some((request) => request.isPendingOptimistic())
  }
}
