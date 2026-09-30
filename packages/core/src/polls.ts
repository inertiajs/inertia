import { Poll, PollCallback } from './poll'
import { PollOptions } from './types'
import { visibility } from './visibility'

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

    // A tab that was already hidden never fires `visibilitychange`, so the
    // listener below would leave this poll running at full cadence
    poll.isInBackground(visibility.isHidden())

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
    visibility.onChange((hidden) => {
      this.polls.forEach((poll) => poll.isInBackground(hidden))
    })
  }
}

export const polls = new Polls()
