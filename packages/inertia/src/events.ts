import { AxiosResponse } from 'axios'
import { Errors, Visit, Page } from './types'

function fireEvent(name: string, options: CustomEventInit): boolean {
  return document.dispatchEvent(
    new CustomEvent(`inertia:${name}`, options),
  )
}

export function fireBeforeEvent(visit: Visit): boolean {
  return fireEvent('before', { cancelable: true, detail: { visit } } )
}

export function fireErrorEvent(errors: Errors): boolean {
  return fireEvent('error', { detail: { errors } })
}

export function fireExceptionEvent(exception: unknown): boolean {
  return fireEvent('exception', { cancelable: true, detail: { exception } })
}

export function fireFinishEvent(visit: Visit): boolean {
  return fireEvent('finish', { detail: { visit } } )
}

export function fireInvalidEvent(response: AxiosResponse): boolean {
  return fireEvent('invalid', { cancelable: true, detail: { response } })
}

export function fireNavigateEvent(page: Page): boolean {
  return fireEvent('navigate', { detail: { page } })
}

export function fireProgressEvent(progress: Record<string, unknown>): boolean {
  return fireEvent('progress', { detail: { progress } })
}

export function fireStartEvent(visit: Visit): boolean {
  return fireEvent('start', { detail: { visit } } )
}

export function fireSuccessEvent(page: Page): boolean {
  return fireEvent('success', { detail: { page } })
}
