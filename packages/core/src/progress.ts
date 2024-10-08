import NProgress from 'nprogress'
import { GlobalEvent } from './types'

const hideProgressStyleEl = (() => {
  if (typeof document === 'undefined') {
    return null
  }

  const el = document.createElement('style')

  el.innerHTML = '#nprogress { display: none; }'

  return el
})()

let hideCount = 0

const removeStyle = () => {
  if (hideProgressStyleEl && document.head.contains(hideProgressStyleEl)) {
    return document.head.removeChild(hideProgressStyleEl)
  }
}

export const reveal = (force = false) => {
  hideCount = Math.max(0, hideCount - 1)

  if (force || hideCount === 0) {
    removeStyle()
  }
}

export const hide = () => {
  hideCount++

  if (hideProgressStyleEl && !document.head.contains(hideProgressStyleEl)) {
    document.head.appendChild(hideProgressStyleEl)
  }
}

function addEventListeners(delay: number): void {
  document.addEventListener('inertia:start', (e) => start(e, delay))
  document.addEventListener('inertia:progress', progress)
}

function start(event: GlobalEvent<'start'>, delay: number): void {
  if (!event.detail.visit.showProgress) {
    hide()
  }

  const timeout = setTimeout(() => NProgress.start(), delay)
  document.addEventListener('inertia:finish', (e) => finish(e, timeout), { once: true })
}

function progress(event: GlobalEvent<'progress'>): void {
  if (NProgress.isStarted() && event.detail.progress?.percentage) {
    NProgress.set(Math.max(NProgress.status!, (event.detail.progress.percentage / 100) * 0.9))
  }
}

function finish(event: GlobalEvent<'finish'>, timeout: NodeJS.Timeout): void {
  clearTimeout(timeout!)

  if (!NProgress.isStarted()) {
    return
  }

  if (event.detail.visit.completed) {
    NProgress.done()
  } else if (event.detail.visit.interrupted) {
    NProgress.set(0)
  } else if (event.detail.visit.cancelled) {
    NProgress.done()
    NProgress.remove()
  }
}

function injectCSS(color: string): void {
  const element = document.createElement('style')
  element.textContent = `
    #nprogress {
      pointer-events: none;
    }

    #nprogress .bar {
      background: ${color};

      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;
    }

    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
      opacity: 1.0;

      -webkit-transform: rotate(3deg) translate(0px, -4px);
          -ms-transform: rotate(3deg) translate(0px, -4px);
              transform: rotate(3deg) translate(0px, -4px);
    }

    #nprogress .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }

    #nprogress .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;

      border: solid 2px transparent;
      border-top-color: ${color};
      border-left-color: ${color};
      border-radius: 50%;

      -webkit-animation: nprogress-spinner 400ms linear infinite;
              animation: nprogress-spinner 400ms linear infinite;
    }

    .nprogress-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .nprogress-custom-parent #nprogress .spinner,
    .nprogress-custom-parent #nprogress .bar {
      position: absolute;
    }

    @-webkit-keyframes nprogress-spinner {
      0%   { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }
    @keyframes nprogress-spinner {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(element)
}

export default function setupProgress({
  delay = 250,
  color = '#29d',
  includeCSS = true,
  showSpinner = false,
} = {}): void {
  addEventListeners(delay)
  NProgress.configure({ showSpinner })
  if (includeCSS) {
    injectCSS(color)
  }
}
