export default class Queue<T> {
  protected items: (() => T)[] = []
  protected processingPromise: Promise<void> | null = null

  public add(item: () => T) {
    this.items.push(item)
    return this.process()
  }

  public process(): Promise<void> {
    this.processingPromise ??= this.processNext().then(
      () => {
        this.processingPromise = null

        if (this.items.length) {
          return this.process()
        }
      },
      (error) => {
        this.processingPromise = null
        throw error
      },
    )

    return this.processingPromise
  }

  protected processNext(): Promise<void> {
    const next = this.items.shift()

    if (next) {
      return Promise.resolve(next()).then(() => this.processNext())
    }

    return Promise.resolve()
  }
}
