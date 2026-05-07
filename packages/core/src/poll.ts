import { PollOptions } from './types'

export type PollHooks = {
  onStart: (cancel: VoidFunction) => void
  onFinish: VoidFunction
}

export type PollCallback = (hooks: PollHooks) => void

export class Poll {
  protected id: number | null = null
  protected throttle = false
  protected keepAlive = false
  protected cb: PollCallback
  protected interval: number
  protected cbCount = 0
  protected overlap?: 'allow' | 'skip' | 'cancel'
  protected inFlight = false
  protected currentCancel: VoidFunction | null = null

  constructor(interval: number, cb: PollCallback, options: PollOptions) {
    this.keepAlive = options.keepAlive ?? false
    this.overlap = options.overlap

    this.cb = cb
    this.interval = interval

    if (options.autoStart ?? true) {
      this.start()
    }
  }

  public stop() {
    if (this.id) {
      clearInterval(this.id)
    }
  }

  public start() {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()

    this.id = window.setInterval(() => {
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

  protected fire() {
    if (this.inFlight) {
      if (this.overlap === 'skip') {
        return
      }

      if (this.overlap === 'cancel') {
        this.currentCancel?.()
      }
    }

    this.cb({
      onStart: (cancel) => {
        this.inFlight = true
        this.currentCancel = cancel
      },
      onFinish: () => {
        this.inFlight = false
        this.currentCancel = null
      },
    })
  }
}
