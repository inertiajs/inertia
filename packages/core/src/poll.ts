import { PollOptions } from './types'

export class Poll {
  protected id: number | null = null
  protected inBackground = false
  protected keepAlive = false
  protected currentInterval: number
  protected originalInterval: number

  constructor(interval: number, cb: VoidFunction, options: PollOptions) {
    this.keepAlive = options.keepAlive || false

    this.currentInterval = interval
    this.originalInterval = interval

    this.start(interval, cb)
  }

  public stop() {
    if (this.id) {
      clearInterval(this.id)
    }
  }

  public isInBackground(hidden: boolean) {
    this.inBackground = this.keepAlive ? false : hidden

    if (this.inBackground) {
      // Throttle requests by 95% when the page is in the background
      this.currentInterval = Math.round(this.originalInterval / 0.05)
    } else {
      this.currentInterval = this.originalInterval
    }
  }

  protected start(interval: number, cb: VoidFunction) {
    this.id = window.setInterval(() => {
      if (this.currentInterval === interval) {
        cb()
        return
      }

      // The visibility has changed, so we need to adjust the interval
      this.stop()
      this.start(this.currentInterval, cb)
    }, interval)
  }
}
