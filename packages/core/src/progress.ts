import ProgressComponent from './progress-component'
import { GlobalEvent } from './types'

class Progress {
  public hideCount = 0

  public start(): void {
    ProgressComponent.start()
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

function addEventListeners(delay: number): void {
  document.addEventListener('inertia:start', (e) => handleStartEvent(e, delay))
  document.addEventListener('inertia:progress', handleProgressEvent)
}

function handleStartEvent(event: GlobalEvent<'start'>, delay: number): void {
  if (!event.detail.visit.showProgress) {
    progress.hide()
  }

  const timeout = setTimeout(() => progress.start(), delay)
  document.addEventListener('inertia:finish', (e) => finish(e, timeout), { once: true })
}

function handleProgressEvent(event: GlobalEvent<'progress'>): void {
  if (progress.isStarted() && event.detail.progress?.percentage) {
    progress.set(Math.max(progress.getStatus()!, (event.detail.progress.percentage / 100) * 0.9))
  }
}

function finish(event: GlobalEvent<'finish'>, timeout: NodeJS.Timeout): void {
  clearTimeout(timeout!)

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
  delay = 250,
  color = '#29d',
  includeCSS = true,
  showSpinner = false,
} = {}): void {
  addEventListeners(delay)
  ProgressComponent.configure({ showSpinner, includeCSS, color })
}
