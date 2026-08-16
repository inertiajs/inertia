import { DestroyRef, afterNextRender, inject } from '@angular/core'
import { router, type PollOptions, type ReloadOptions } from '@inertiajs/core'

export function usePoll(
  interval: number,
  requestOptions: ReloadOptions | (() => ReloadOptions) = {},
  options: PollOptions = {},
): { stop: VoidFunction; start: VoidFunction } {
  const destroyRef = inject(DestroyRef)
  const autoStart = options.autoStart ?? true
  const poll = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  afterNextRender(() => {
    if (autoStart) poll.start()
  })
  destroyRef.onDestroy(poll.destroy)

  return { stop: poll.stop, start: poll.start }
}
