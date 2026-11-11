import { describe, expect, it } from 'vitest'
import Queue from '../src/queue'

const ticks = async (count: number): Promise<void> => {
  for (let tick = 0; tick < count; tick++) {
    await Promise.resolve()
  }
}

describe('the queue behind visits, responses and history writes', () => {
  it('runs its items one after another', async () => {
    const queue = new Queue<Promise<void>>()
    const ran: string[] = []

    queue.add(async () => {
      await ticks(2)
      ran.push('first')
    })

    await queue.add(async () => {
      ran.push('second')
    })

    expect(ran).toEqual(['first', 'second'])
  })

  for (const tick of [0, 1, 2, 3, 4, 5]) {
    it(`settles only once the item added ${tick} ticks into the run has finished`, async () => {
      const queue = new Queue<Promise<void>>()
      const ran: string[] = []

      queue.add(async () => {
        await ticks(2)
        ran.push('first')
      })

      await ticks(tick)

      await queue.add(async () => {
        await ticks(3)
        ran.push('second')
      })

      expect(ran).toEqual(['first', 'second'])
    })
  }
})
