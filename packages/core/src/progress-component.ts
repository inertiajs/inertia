/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

import { ProgressSettings } from './types'

const baseComponentSelector = 'nprogress'

let usePopover: boolean
let progress: HTMLDivElement

const settings: ProgressSettings = {
  minimum: 0.08,
  easing: 'linear',
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: '[role="bar"]',
  spinnerSelector: '[role="spinner"]',
  parent: 'body',
  color: '#29d',
  includeCSS: true,
  popover: null,
  template: [
    '<div class="bar" role="bar">',
    '<div class="peg"></div>',
    '</div>',
    '<div class="spinner" role="spinner">',
    '<div class="spinner-icon"></div>',
    '</div>',
  ].join(''),
}

let status: number | null = null
let hidden = false

const configure = (options: Partial<ProgressSettings>) => {
  Object.assign(settings, options)

  usePopover = settings.popover ?? 'popover' in HTMLElement.prototype

  if (settings.includeCSS) {
    injectCSS(settings.color)
  }

  progress = document.createElement('div')
  progress.id = baseComponentSelector
  progress.innerHTML = settings.template

  if (usePopover) {
    progress.popover = 'manual'
  }
}

/**
 * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
 */
const set = (n: number) => {
  const started = isStarted()

  n = clamp(n, settings.minimum, 1)
  status = n === 1 ? null : n

  const progress = render(!started)
  const bar = progress.querySelector(settings.barSelector)! as HTMLElement
  const speed = settings.speed
  const ease = settings.easing

  progress.offsetWidth /* Repaint */

  queue((next) => {
    const barStyles: Partial<CSSStyleDeclaration> = {
      transition: `all ${speed}ms ${ease}`,
      transform: `translate3d(${toBarPercentage(n)}%,0,0)`,
    }

    for (const key in barStyles) {
      bar.style[key] = barStyles[key]!
    }

    if (n !== 1) {
      return setTimeout(next, speed)
    }

    // Fade out
    progress.style.transition = 'none'
    progress.style.opacity = '1'
    progress.offsetWidth /* Repaint */

    setTimeout(() => {
      progress.style.transition = `all ${speed}ms linear`
      progress.style.opacity = '0'

      setTimeout(() => {
        remove()
        progress.style.transition = ''
        progress.style.opacity = ''
        next()
      }, speed)
    }, speed)
  })
}

const isStarted = () => typeof status === 'number'

/**
 * Shows the progress bar.
 * This is the same as setting the status to 0%, except that it doesn't go backwards.
 */
const start = () => {
  if (!status) {
    set(0)
  }

  const work = function () {
    setTimeout(function () {
      if (!status) {
        return
      }

      increaseByRandom()
      work()
    }, settings.trickleSpeed)
  }

  if (settings.trickle) {
    work()
  }
}

/**
 * Hides the progress bar.
 * This is the *sort of* the same as setting the status to 100%, with the
 * difference being `done()` makes some placebo effect of some realistic motion.
 *
 * If `true` is passed, it will show the progress bar even if it's hidden.
 */
const done = (force?: boolean) => {
  if (!force && !status) {
    return
  }

  increaseByRandom(0.3 + 0.5 * Math.random())
  set(1)
}

const increaseByRandom = (amount?: number) => {
  const n = status

  if (n === null) {
    return start()
  }

  if (n > 1) {
    return
  }

  amount =
    typeof amount === 'number'
      ? amount
      : (() => {
          const ranges: Record<number, [number, number]> = {
            0.1: [0, 0.2],
            0.04: [0.2, 0.5],
            0.02: [0.5, 0.8],
            0.005: [0.8, 0.99],
          }

          for (const r in ranges) {
            if (n >= ranges[r][0] && n < ranges[r][1]) {
              return parseFloat(r)
            }
          }

          return 0
        })()

  return set(clamp(n + amount, 0, 0.994))
}

/**
 * (Internal) renders the progress bar markup based on the `template` setting.
 */
const render = (fromStart: boolean) => {
  if (isRendered()) {
    return document.getElementById(baseComponentSelector)!
  }

  document.documentElement.classList.add(`${baseComponentSelector}-busy`)

  const bar = progress.querySelector(settings.barSelector)! as HTMLElement
  const perc = fromStart ? '-100' : toBarPercentage(status || 0)

  bar.style.transition = 'all 0 linear'
  bar.style.transform = `translate3d(${perc}%,0,0)`

  if (!settings.showSpinner) {
    progress.querySelector(settings.spinnerSelector)?.remove()
  }

  if (usePopover) {
    document.body.appendChild(progress)

    if (!hidden) {
      progress.showPopover()
    }
  } else {
    const parent = getParent()

    if (parent !== document.body) {
      parent.classList.add(`${baseComponentSelector}-custom-parent`)
    }

    parent.appendChild(progress)

    if (hidden) {
      progress.style.display = 'none'
    }
  }

  return progress
}

const getParent = (): HTMLElement => {
  return document.querySelector(settings.parent) as HTMLElement
}

const remove = () => {
  document.documentElement.classList.remove(`${baseComponentSelector}-busy`)

  if (usePopover && progress?.isConnected) {
    try {
      progress.hidePopover()
    } catch {
      // Already hidden
    }
  }

  if (!usePopover) {
    getParent().classList.remove(`${baseComponentSelector}-custom-parent`)
  }

  progress?.remove()
}

const isRendered = () => {
  return document.getElementById(baseComponentSelector) !== null
}

function clamp(n: number, min: number, max: number): number {
  if (n < min) {
    return min
  }

  if (n > max) {
    return max
  }

  return n
}

// Converts a percentage (`0..1`) to a bar translateX percentage (`-100%..0%`).
const toBarPercentage = (n: number) => (-1 + n) * 100

// Queues a function to be executed.
const queue = (() => {
  const pending: ((...args: any[]) => any)[] = []

  const next = () => {
    const fn = pending.shift()

    if (fn) {
      fn(next)
    }
  }

  return (fn: (...args: any[]) => any) => {
    pending.push(fn)

    if (pending.length === 1) {
      next()
    }
  }
})()

const injectCSS = (color: string): void => {
  const element = document.createElement('style')

  element.textContent = `
    #${baseComponentSelector} {
      pointer-events: none;
      background: none;
      border: none;
      margin: 0;
      padding: 0;
      overflow: visible;
      inset: unset;
      width: 100%;
      height: 0;
      position: fixed;
      top: 0;
      left: 0;
    }

    #${baseComponentSelector}::backdrop {
      display: none;
    }

    #${baseComponentSelector} .bar {
      background: ${color};

      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;
    }

    #${baseComponentSelector} .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
      opacity: 1.0;

      transform: rotate(3deg) translate(0px, -4px);
    }

    #${baseComponentSelector} .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }

    #${baseComponentSelector} .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;

      border: solid 2px transparent;
      border-top-color: ${color};
      border-left-color: ${color};
      border-radius: 50%;

      animation: ${baseComponentSelector}-spinner 400ms linear infinite;
    }

    .${baseComponentSelector}-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .spinner,
    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .bar {
      position: absolute;
    }

    @keyframes ${baseComponentSelector}-spinner {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(element)
}

const show = () => {
  hidden = false

  if (!progress?.isConnected) {
    return
  }

  if (usePopover) {
    try {
      progress.showPopover()
    } catch {
      // Already showing
    }
  } else {
    progress.style.display = ''
  }
}

const hide = () => {
  hidden = true

  if (!progress?.isConnected) {
    return
  }

  if (usePopover) {
    try {
      progress.hidePopover()
    } catch {
      // Already hidden
    }
  } else {
    progress.style.display = 'none'
  }
}

export default {
  configure,
  isStarted,
  done,
  set,
  remove,
  start,
  status,
  show,
  hide,
}
