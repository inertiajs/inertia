export default class Queue<T> {
  protected items: (() => T)[] = []
  protected processing = false

  public add(item: () => T) {
    this.items.push(item)
    this.process()
  }

  protected process() {
    if (this.processing) {
      return
    }

    this.processing = true

    this.processNext().then(() => {
      this.processing = false
    })
  }

  protected processNext(): Promise<void> {
    const next = this.items.shift()

    if (next) {
      return Promise.resolve(next()).then(() => this.processNext())
    }

    return Promise.resolve()
  }
}
