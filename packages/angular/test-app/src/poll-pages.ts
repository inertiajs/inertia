import { Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core'
import { Link, router, useForm, usePage, usePoll, type ResolvedComponent } from '@inertiajs/angular'
import type { PollOptions } from '@inertiajs/core'

@Component({ selector: 'test-poll-hook', imports: [Link], template: '<a inertiaLink href="/">Home</a>' })
class PollHook {
  constructor() {
    usePoll(500, { only: ['custom_prop'], onFinish: () => console.log('hook poll finished') })
  }
}

@Component({
  selector: 'test-poll-manual',
  template:
    '<button type="button" (click)="poll.start()">Start</button><button type="button" (click)="poll.stop()">Stop</button>',
})
class PollHookManual {
  readonly poll = usePoll(
    500,
    { only: ['custom_prop'], onFinish: () => console.log('hook poll finished') },
    { autoStart: false },
  )
}

@Component({
  selector: 'test-router-poll-manual',
  template:
    '<button type="button" (click)="poll.start()">Start</button><button type="button" (click)="poll.stop()">Stop</button>',
})
class RouterPollManual {
  readonly poll = router.poll(
    500,
    { only: ['custom_prop'], onFinish: () => console.log('hook poll finished') },
    { autoStart: false },
  )

  constructor() {
    inject(DestroyRef).onDestroy(this.poll.destroy)
  }
}

@Component({
  selector: 'test-poll-overlap',
  template: `
    <span id="mode">{{ mode() }}</span
    ><span id="time">{{ time() }}</span> <button type="button" (click)="poll.stop()">Stop</button
    ><button type="button" (click)="poll.start()">Start</button>
  `,
})
class PollOverlap {
  readonly mode = input('none')
  readonly time = input(0)
  readonly page = usePage<{ mode?: string }>()
  readonly params = new URLSearchParams(window.location.search)
  readonly initialMode = this.page().props.mode ?? 'none'
  readonly options: PollOptions = {
    ...(this.isMode(this.initialMode) ? { mode: this.initialMode } : {}),
    ...(this.params.get('keepAlive') === '1' ? { keepAlive: true } : {}),
  }
  readonly poll = usePoll(Number(this.params.get('interval') ?? 200), {}, this.options)

  private isMode(mode: string): mode is NonNullable<PollOptions['mode']> {
    return mode === 'overlap' || mode === 'cancel' || mode === 'rest'
  }
}

@Component({
  selector: 'test-poll-unchanged',
  template: `
    <p>
      replaceState calls: <span class="replaceStateCalls">{{ replaceStateCalls() }}</span>
    </p>
    <p>
      polls finished: <span class="pollsFinished">{{ pollsFinished() }}</span>
    </p>
  `,
})
class PollUnchangedData {
  readonly replaceStateCalls = signal(0)
  readonly pollsFinished = signal(0)

  constructor() {
    const destroyRef = inject(DestroyRef)
    afterNextRender(() => {
      const original = window.history.replaceState.bind(window.history)
      window.history.replaceState = (...args) => {
        this.replaceStateCalls.update((count) => count + 1)
        return original(...args)
      }
      destroyRef.onDestroy(() => {
        window.history.replaceState = original
      })
    })
    usePoll(500, { only: ['custom_prop'], onFinish: () => this.pollsFinished.update((count) => count + 1) })
  }
}

@Component({
  selector: 'test-poll-dynamic',
  imports: [Link],
  template: `
    <div id="counter">counter: {{ counter() }}</div>
    <div id="last_received">received: {{ lastReceived() ?? 'null' }}</div>
    <button type="button" (click)="increment()">Increment</button><a inertiaLink href="/">Home</a>
  `,
})
class PollDynamicData {
  readonly counter = input(0)
  readonly lastReceived = input<number | null>(null, { alias: 'last_received' })

  constructor() {
    usePoll(300, () => ({ data: { counter_seen: this.counter() }, only: ['last_received'] }))
  }

  increment(): void {
    router.reload({ only: ['counter'], data: { bump: this.counter() + 1 } })
  }
}

@Component({
  selector: 'test-poll-preserve-errors',
  template: `
    @if (page().props.errors['name']) {
      <p id="page-error">{{ page().props.errors['name'] }}</p>
    }
    @if (form.errors().name) {
      <p id="form-error">{{ form.errors().name }}</p>
    }
    <button type="button" (click)="form.post('/poll/preserve-errors')">Submit</button>
    <p id="time">Time: {{ time() }}</p>
  `,
})
class PollPreserveErrors {
  readonly time = input(0)
  readonly page = usePage()
  readonly form = useForm({ name: '' })

  constructor() {
    usePoll(300, { only: ['time'] })
  }
}

@Component({
  selector: 'test-poll-flag',
  template: `
    <div id="poll-flag">poll: {{ pollFlag() }}</div>
    <div id="reload-flag">reload: {{ reloadFlag() }}</div>
    <button type="button" (click)="reload()">Reload</button>
  `,
})
class PollFlag {
  readonly pollFlag = signal('pending')
  readonly reloadFlag = signal('pending')

  constructor() {
    usePoll(500, { onFinish: (visit) => this.pollFlag.set(String('poll' in visit && visit.poll === true)) })
  }

  reload(): void {
    router.reload({ onFinish: (visit) => this.reloadFlag.set(String('poll' in visit && visit.poll === true)) })
  }
}

export const pollPages: Record<string, ResolvedComponent> = {
  'Poll/Hook': PollHook,
  'Poll/HookManual': PollHookManual,
  'Poll/RouterManual': RouterPollManual,
  'Poll/Overlap': PollOverlap,
  'Poll/UnchangedData': PollUnchangedData,
  'Poll/DynamicData': PollDynamicData,
  'Poll/PreserveErrors': PollPreserveErrors,
  'Poll/Flag': PollFlag,
}
