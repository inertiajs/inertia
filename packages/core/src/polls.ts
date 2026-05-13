import { Poll, PollCallback } from './poll'
import { PollOptions } from './types'

class Polls {
  protected polls: Poll[] = []

  constructor() {
    this.setupVisibilityListener()
  }

  public get count(): number {
    return this.polls.length
  }

  public add(
    interval: number,
    cb: PollCallback,
    options: PollOptions,
  ): {
    stop: VoidFunction
    start: VoidFunction
    destroy: VoidFunction
  } {
    const poll = new Poll(interval, cb, options)

    this.polls.push(poll)

    return {
      stop: () => poll.stop(),
      start: () => poll.start(),
      destroy: () => {
        poll.stop()
        this.polls = this.polls.filter((p) => p !== poll)
      },
    }
  }

  public clear() {
    this.polls.forEach((poll) => poll.stop())

    this.polls = []
  }

  protected setupVisibilityListener() {
    if (typeof document === 'undefined') {
      return
    }

    document.addEventListener(
      'visibilitychange',
      () => {
        this.polls.forEach((poll) => poll.isInBackground(document.hidden))
      },
      false,
    )
  }
}

export const polls = new Polls()
