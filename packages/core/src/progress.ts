import ProgressComponent from './progress-component'
import { GlobalEvent } from './types'

let hideCount = 0

export const reveal = (force = false) => {
  hideCount = Math.max(0, hideCount - 1)

  if (force || hideCount === 0) {
    ProgressComponent.show()
  }
}

export const hide = () => {
  hideCount++

  ProgressComponent.hide()
}

function addEventListeners(delay: number): void {
  document.addEventListener('inertia:start', (e) => start(e, delay))
  document.addEventListener('inertia:progress', progress)
}

function start(event: GlobalEvent<'start'>, delay: number): void {
  if (!event.detail.visit.showProgress) {
    hide()
  }

  const timeout = setTimeout(() => ProgressComponent.start(), delay)
  document.addEventListener('inertia:finish', (e) => finish(e, timeout), { once: true })
}

function progress(event: GlobalEvent<'progress'>): void {
  if (ProgressComponent.isStarted() && event.detail.progress?.percentage) {
    ProgressComponent.set(Math.max(ProgressComponent.status!, (event.detail.progress.percentage / 100) * 0.9))
  }
}

function finish(event: GlobalEvent<'finish'>, timeout: NodeJS.Timeout): void {
  clearTimeout(timeout!)

  if (!ProgressComponent.isStarted()) {
    return
  }

  if (event.detail.visit.completed) {
    ProgressComponent.done()
  } else if (event.detail.visit.interrupted) {
    ProgressComponent.set(0)
  } else if (event.detail.visit.cancelled) {
    ProgressComponent.done()
    ProgressComponent.remove()
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
