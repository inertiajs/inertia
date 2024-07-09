import { test } from 'vitest'

test('we can set the current page', { todo: true }, () => {
  // sensible defaults for scrollRegions and rememberedState
})

test('we can set the current page and preserve scroll', { todo: true }, () => {})

test('we can replace the current page', { todo: true }, () => {})

test(
  'if there is a race condition we will not swap in an old component if there is a newer one',
  { todo: true },
  () => {},
)
