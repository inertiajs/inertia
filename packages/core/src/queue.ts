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

  // Cleared in the same tick as the check that ended the loop, so a later add starts its own run.
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

export const responseQueue = new Queue<Promise<boolean | void>>()
