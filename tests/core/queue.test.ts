import test, { expect } from '@playwright/test'
import Queue from '../../packages/core/src/queue'

test.describe('queue.ts', () => {
  test('drains tasks added while the previous drain is settling', async () => {
    const queue = new Queue<void | Promise<void>>()
    const calls: number[] = []
    const first = queue.add(() => {
      calls.push(1)
    })

    // Let processNext observe an empty queue before the drain's completion handler runs.
    await Promise.resolve()

    const second = queue.add(async () => {
      await Promise.resolve()
      calls.push(2)
    })

    await first
    expect(calls).toEqual([1, 2])
    await second
  })

  test('processes synchronous and asynchronous tasks in order', async () => {
    const queue = new Queue<void | Promise<void>>()
    const calls: number[] = []
    let release!: () => void
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })

    const first = queue.add(async () => {
      calls.push(1)
      await pending
      calls.push(2)
    })
    const second = queue.add(() => {
      calls.push(3)
    })

    expect(calls).toEqual([1])
    release()
    await Promise.all([first, second])
    expect(calls).toEqual([1, 2, 3])
  })

  test('drains tasks added by a running callback', async () => {
    const queue = new Queue<void | Promise<void>>()
    const calls: number[] = []
    const first = queue.add(async () => {
      await Promise.resolve()
      calls.push(1)
      queue.add(() => {
        calls.push(3)
      })
    })
    queue.add(() => {
      calls.push(2)
    })

    await first
    expect(calls).toEqual([1, 2, 3])
  })

  test('can reuse an empty queue', async () => {
    const queue = new Queue<void>()
    const calls: number[] = []

    await queue.process()
    await queue.add(() => {
      calls.push(1)
    })
    await queue.process()
    await queue.add(() => {
      calls.push(2)
    })

    expect(calls).toEqual([1, 2])
  })

  test('drains tasks added while an empty process call is settling', async () => {
    const queue = new Queue<void>()
    const calls: number[] = []
    const processing = queue.process()
    queue.add(() => {
      calls.push(1)
    })

    await processing
    expect(calls).toEqual([1])
  })

  test('waits for an asynchronous task added while the drain is settling', async () => {
    const queue = new Queue<void | Promise<void>>()
    let release!: () => void
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    let settled = false
    const first = queue.add(() => {})
    const completion = first.then(() => {
      settled = true
    })

    await Promise.resolve()

    let started!: () => void
    const taskStarted = new Promise<void>((resolve) => {
      started = resolve
    })
    queue.add(() => {
      started()
      return pending
    })

    await taskStarted
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(settled).toBe(false)
    release()
    await completion
    expect(settled).toBe(true)
  })

  test('rejects failed tasks and allows a later drain to resume', async () => {
    const queue = new Queue<void | Promise<void>>()
    const calls: number[] = []
    const error = new Error('Task failed')
    const first = queue.add(() => Promise.reject(error))
    queue.add(() => {
      calls.push(1)
    })

    await expect(first).rejects.toBe(error)
    expect(calls).toEqual([])

    await queue.add(() => {
      calls.push(2)
    })
    expect(calls).toEqual([1, 2])
  })

  test('propagates errors from tasks added while the drain is settling', async () => {
    const queue = new Queue<void | Promise<void>>()
    const error = new Error('Task failed')
    const first = queue.add(() => {})

    await Promise.resolve()

    queue.add(() => Promise.reject(error))

    await expect(first).rejects.toBe(error)
    await queue.add(() => {})
  })
})
