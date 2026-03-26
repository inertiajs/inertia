import ProgressComponent from './progress-component'
import { GlobalEvent, ProgressOptions } from './types'

const DEFAULT_DELAY = 250

let configuredDelay = DEFAULT_DELAY

class Progress {
  public hideCount = 0

  public start(): void {
    ProgressComponent.start()
  }

  public startWithDelay(delay?: number): () => void {
    const ms = delay ?? configuredDelay

    const timeout = setTimeout(() => this.start(), ms)

    return () => clearTimeout(timeout)
  }

  public reveal(force: boolean = false): void {
    this.hideCount = Math.max(0, this.hideCount - 1)

    if (force || this.hideCount === 0) {
      ProgressComponent.show()
    }
  }

  public hide(): void {
    this.hideCount++

    ProgressComponent.hide()
  }

  public set(status: number): void {
    ProgressComponent.set(Math.max(0, Math.min(1, status)))
  }

  public finish(): void {
    ProgressComponent.done()
  }

  public reset(): void {
    ProgressComponent.set(0)
  }

  public remove(): void {
    ProgressComponent.done()
    ProgressComponent.remove()
  }

  public isStarted(): boolean {
    return ProgressComponent.isStarted()
  }

  public getStatus(): number | null {
    return ProgressComponent.status
  }
}

export const progress = new Progress()

function addEventListeners(): void {
  document.addEventListener('inertia:start', handleStartEvent)
  document.addEventListener('inertia:progress', handleProgressEvent)
}

function handleStartEvent(event: GlobalEvent<'start'>): void {
  if (!event.detail.visit.showProgress) {
    progress.hide()
  }

  const cancel = progress.startWithDelay()

  document.addEventListener(
    'inertia:finish',
    (e) => {
      cancel()
      finish(e)
    },
    { once: true },
  )
}

function handleProgressEvent(event: GlobalEvent<'progress'>): void {
  if (progress.isStarted() && event.detail.progress?.percentage) {
    progress.set(Math.max(progress.getStatus()!, (event.detail.progress.percentage / 100) * 0.9))
  }
}

function finish(event: GlobalEvent<'finish'>): void {
  if (!progress.isStarted()) {
    return
  }

  if (event.detail.visit.completed) {
    progress.finish()
  } else if (event.detail.visit.interrupted) {
    progress.reset()
  } else if (event.detail.visit.cancelled) {
    progress.remove()
  }
}

export default function setupProgress({
  delay = DEFAULT_DELAY,
  color = '#29d',
  includeCSS = true,
  showSpinner = false,
  popover = null,
}: ProgressOptions = {}): void {
  configuredDelay = delay
  addEventListeners()
  ProgressComponent.configure({ showSpinner, includeCSS, color, popover })
}
