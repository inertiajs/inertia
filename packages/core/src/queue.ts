export default class Queue<T> {
  protected items: (() => T)[] = []
  protected running = false
  protected processingPromise: Promise<void> = Promise.resolve()

  public add(item: () => T) {
    this.items.push(item)

    return this.process()
  }

  public process() {
    if (!this.running) {
      this.running = true
      this.processingPromise = this.drain()
    }

    return this.processingPromise
  }

  // The flag falls in the same tick as the check that ended the loop, so an item added from here on
  // starts a run of its own rather than joining a promise that has already settled.
  protected async drain(): Promise<void> {
    try {
      for (let next = this.items.shift(); next; next = this.items.shift()) {
        await next()
      }
    } finally {
      this.running = false
    }
  }
}
