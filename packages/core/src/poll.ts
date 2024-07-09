class Poll {
  protected polls: VoidFunction[] = []

  add(interval: number, cb: VoidFunction): VoidFunction {
    const id = setInterval(cb, interval)

    const stop = () => clearInterval(id)

    this.polls.push(stop)

    return stop
  }

  clear() {
    this.polls.forEach((stop) => stop())

    this.polls = []
  }
}

export const poll = new Poll()
