import ProgressComponent from './progress-component'
import { GlobalEvent } from './types'

let hideCount = 0

export class Progress {
  public start(): void {
    ProgressComponent.start()
  }

  public reveal(force: boolean = false): void {
    hideCount = Math.max(0, hideCount - 1)

    if (force || hideCount === 0) {
      ProgressComponent.show()
    }
  }

  public hide(): void {
    hideCount++

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

const progressInstance = new Progress()

export const reveal = progressInstance.reveal
export const hide = progressInstance.hide

function addEventListeners(delay: number): void {
  document.addEventListener('inertia:start', (e) => start(e, delay))
  document.addEventListener('inertia:progress', progress)
}

function start(event: GlobalEvent<'start'>, delay: number): void {
  if (!event.detail.visit.showProgress) {
    progressInstance.hide()
  }

  const timeout = setTimeout(() => progressInstance.start(), delay)
  document.addEventListener('inertia:finish', (e) => finish(e, timeout), { once: true })
}

function progress(event: GlobalEvent<'progress'>): void {
  if (progressInstance.isStarted() && event.detail.progress?.percentage) {
    progressInstance.set(Math.max(progressInstance.getStatus()!, (event.detail.progress.percentage / 100) * 0.9))
  }
}

function finish(event: GlobalEvent<'finish'>, timeout: NodeJS.Timeout): void {
  clearTimeout(timeout!)

  if (!progressInstance.isStarted()) {
    return
  }

  if (event.detail.visit.completed) {
    progressInstance.finish()
  } else if (event.detail.visit.interrupted) {
    progressInstance.reset()
  } else if (event.detail.visit.cancelled) {
    progressInstance.remove()
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
