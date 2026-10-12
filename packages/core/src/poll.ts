import { PollBackgroundOption, PollOptions } from './types'

type PollHooks = {
  onStart: (cancel: VoidFunction) => void
  onFinish: VoidFunction
}

export type PollCallback = (hooks: PollHooks) => void

export class Poll {
  protected intervalId: number | null = null
  protected timeoutId: number | null = null
  protected hidden = false
  protected background: PollBackgroundOption
  protected cb: PollCallback
  protected interval: number
  protected cbCount = 0
  protected mode: 'overlap' | 'cancel' | 'rest'
  protected inFlight = false
  protected currentCancel: VoidFunction | null = null
  protected stopped = true
  protected instanceId = 0
  protected lastPolledAt = 0

  constructor(interval: number, cb: PollCallback, options: PollOptions) {
    this.background = options.background ?? (options.keepAlive ? 'continue' : 'throttle')
    this.hidden = typeof document !== 'undefined' && document.hidden
    this.mode = options.mode ?? 'overlap'

    this.cb = cb
    this.interval = interval

    if (options.autoStart ?? true) {
      this.start()
    }
  }

  public stop() {
    this.stopped = true
    this.instanceId++
    this.inFlight = false
    this.currentCancel = null
    this.clearTimers()
  }

  public start() {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()
    this.stopped = false
    this.lastPolledAt = Date.now()

    if (this.isPaused()) {
      return
    }

    if (this.mode === 'rest') {
      this.scheduleNext()
      return
    }

    this.startInterval()
  }

  public isInBackground(hidden: boolean) {
    if (hidden === this.hidden) {
      return
    }

    this.hidden = hidden

    if (this.isThrottled()) {
      this.cbCount = 0
    }

    if (this.background !== 'pause') {
      return
    }

    if (hidden) {
      this.clearTimers()
    } else {
      this.resume()
    }
  }

  protected isThrottled(): boolean {
    return this.hidden && this.background === 'throttle'
  }

  protected isPaused(): boolean {
    return this.hidden && this.background === 'pause'
  }

  protected resume() {
    if (this.stopped || (this.mode === 'rest' && this.inFlight)) {
      return
    }

    const remaining = this.interval - (Date.now() - this.lastPolledAt)

    if (remaining > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.timeoutId = null
        this.resume()
      }, remaining)

      return
    }

    this.fire()

    if (this.mode !== 'rest') {
      this.startInterval()
    }
  }

  protected startInterval() {
    this.intervalId = window.setInterval(() => this.tick(), this.interval)
  }

  protected clearTimers() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  protected scheduleNext() {
    if (this.stopped || this.isPaused()) {
      return
    }

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null
      this.tick()
    }, this.interval)
  }

  protected tick() {
    const throttled = this.isThrottled()

    if (!throttled || this.cbCount % 10 === 0) {
      this.fire()
    } else if (this.mode === 'rest') {
      this.scheduleNext()
    }

    if (throttled) {
      this.cbCount++
    }
  }

  protected fire() {
    if (this.inFlight && this.mode === 'cancel') {
      this.currentCancel?.()
    }

    this.lastPolledAt = Date.now()

    const instance = this.instanceId

    this.cb({
      onStart: (cancel) => {
        if (instance !== this.instanceId) {
          return
        }

        this.inFlight = true
        this.currentCancel = cancel
      },
      onFinish: () => {
        if (instance !== this.instanceId) {
          return
        }

        this.inFlight = false
        this.currentCancel = null

        if (this.mode === 'rest') {
          this.lastPolledAt = Date.now()
          this.scheduleNext()
        }
      },
    })
  }
}
