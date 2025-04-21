/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

import { ProgressSettings } from './types'

const baseComponentSelector = 'nprogress'

const settings: ProgressSettings = {
  minimum: 0.08,
  easing: 'linear',
  positionUsing: 'translate3d',
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: '[role="bar"]',
  spinnerSelector: '[role="spinner"]',
  parent: 'body',
  color: '#29d',
  includeCSS: true,
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

const configure = (options: Partial<ProgressSettings>) => {
  Object.assign(settings, options)

  if (settings.includeCSS) {
    injectCSS(settings.color)
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
    const barStyles = ((): Partial<CSSStyleDeclaration> => {
      if (settings.positionUsing === 'translate3d') {
        return {
          transition: `all ${speed}ms ${ease}`,
          transform: `translate3d(${toBarPercentage(n)}%,0,0)`,
        }
      }

      if (settings.positionUsing === 'translate') {
        return {
          transition: `all ${speed}ms ${ease}`,
          transform: `translate(${toBarPercentage(n)}%,0)`,
        }
      }

      return { marginLeft: `${toBarPercentage(n)}%` }
    })()

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

  const progress = document.createElement('div')
  progress.id = baseComponentSelector
  progress.innerHTML = settings.template

  const bar = progress.querySelector(settings.barSelector)! as HTMLElement
  const perc = fromStart ? '-100' : toBarPercentage(status || 0)
  const parent = getParent()

  bar.style.transition = 'all 0 linear'
  bar.style.transform = `translate3d(${perc}%,0,0)`

  if (!settings.showSpinner) {
    progress.querySelector(settings.spinnerSelector)?.remove()
  }

  if (parent !== document.body) {
    parent.classList.add(`${baseComponentSelector}-custom-parent`)
  }

  parent.appendChild(progress)

  return progress
}

const getParent = (): HTMLElement => {
  return (isDOM(settings.parent) ? settings.parent : document.querySelector(settings.parent)) as HTMLElement
}

const remove = () => {
  document.documentElement.classList.remove(`${baseComponentSelector}-busy`)
  getParent().classList.remove(`${baseComponentSelector}-custom-parent`)
  document.getElementById(baseComponentSelector)?.remove()
}

const isRendered = () => {
  return document.getElementById(baseComponentSelector) !== null
}

const isDOM = (obj: any) => {
  if (typeof HTMLElement === 'object') {
    return obj instanceof HTMLElement
  }

  return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'
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
  const element = document.getElementById(baseComponentSelector)

  if (element) {
    element.style.display = ''
  }
}

const hide = () => {
  const element = document.getElementById(baseComponentSelector)

  if (element) {
    element.style.display = 'none'
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
