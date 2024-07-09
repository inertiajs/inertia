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

  public cancelInFlight(): void {
    this.cancel({ cancelled: true }, true)
  }

  protected cancel({ cancelled = false, interrupted = false } = {}, force: boolean): void {
    if (!this.shouldCancel(force)) {
      return
    }

    const request = this.requests.shift()!

    request?.cancel({ interrupted, cancelled })
  }

  protected shouldCancel(force: boolean): boolean {
    if (force) {
      return true
    }

    return this.interruptible && this.requests.length >= this.maxConcurrent
  }
}
