import { PollOptions } from './types'

export type PollHooks = {
  onStart: (cancel: VoidFunction) => void
  onFinish: VoidFunction
}

export type PollCallback = (hooks: PollHooks) => void

export class Poll {
  protected intervalId: number | null = null
  protected timeoutId: number | null = null
  protected throttle = false
  protected keepAlive = false
  protected cb: PollCallback
  protected interval: number
  protected cbCount = 0
  protected mode: 'allow' | 'cancel' | 'rest'
  protected inFlight = false
  protected currentCancel: VoidFunction | null = null
  protected stopped = true

  constructor(interval: number, cb: PollCallback, options: PollOptions) {
    this.keepAlive = options.keepAlive ?? false
    this.mode = options.mode ?? 'allow'

    this.cb = cb
    this.interval = interval

    if (options.autoStart ?? true) {
      this.start()
    }
  }

  public stop() {
    this.stopped = true

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  public start() {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()
    this.stopped = false

    if (this.mode === 'rest') {
      this.scheduleNext()
      return
    }

    this.intervalId = window.setInterval(() => {
      if (!this.throttle || this.cbCount % 10 === 0) {
        this.fire()
      }

      if (this.throttle) {
        this.cbCount++
      }
    }, this.interval)
  }

  public isInBackground(hidden: boolean) {
    this.throttle = this.keepAlive ? false : hidden

    if (this.throttle) {
      this.cbCount = 0
    }
  }

  protected scheduleNext() {
    if (this.stopped) {
      return
    }

    const delay = this.throttle ? this.interval * 10 : this.interval

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null
      this.fire()
    }, delay)
  }

  protected fire() {
    if (this.inFlight && this.mode === 'cancel') {
      this.currentCancel?.()
    }

    this.cb({
      onStart: (cancel) => {
        this.inFlight = true
        this.currentCancel = cancel
      },
      onFinish: () => {
        this.inFlight = false
        this.currentCancel = null

        if (this.mode === 'rest') {
          this.scheduleNext()
        }
      },
    })
  }
}
