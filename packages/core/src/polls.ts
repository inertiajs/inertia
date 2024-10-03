import { Poll } from './poll'
import { PollOptions } from './types'

class Polls {
  protected polls: Poll[] = []

  constructor() {
    this.setupVisibilityListener()
  }

  public add(
    interval: number,
    cb: VoidFunction,
    options: PollOptions,
  ): {
    stop: VoidFunction
    start: VoidFunction
  } {
    const poll = new Poll(interval, cb, options)

    this.polls.push(poll)

    return {
      stop: () => poll.stop(),
      start: () => poll.start(),
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
