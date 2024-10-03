import { PollOptions } from './types'

export class Poll {
  protected id: number | null = null
  protected throttle = false
  protected keepAlive = false
  protected cb: VoidFunction
  protected interval: number
  protected cbCount = 0

  constructor(interval: number, cb: VoidFunction, options: PollOptions) {
    this.keepAlive = options.keepAlive ?? false

    this.cb = cb
    this.interval = interval

    if (options.autoStart ?? true) {
      this.start()
    }
  }

  public stop() {
    // console.log('stopping...', this.id)
    if (this.id) {
      //   console.log('clearing interval...')
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
        this.cb()
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
}
