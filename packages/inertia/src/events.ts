import { AxiosResponse } from 'axios'
import { Page, PendingVisit } from './types'

function fireEvent(name: string, options: CustomEventInit): boolean {
  return document.dispatchEvent(
    new CustomEvent(`inertia:${name}`, options),
  )
}

export function fireBeforeEvent(visit: PendingVisit): boolean {
  return fireEvent('before', { cancelable: true, detail: { visit } } )
}

export function fireErrorEvent(errors: Record<string, unknown>): boolean {
  return fireEvent('error', { detail: { errors } })
}

export function fireExceptionEvent(exception: unknown): boolean {
  return fireEvent('exception', { cancelable: true, detail: { exception } })
}

export function fireFinishEvent(visit: PendingVisit): boolean {
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

export function fireStartEvent(visit: PendingVisit): boolean {
  return fireEvent('start', { detail: { visit } } )
}

export function fireSuccessEvent(page: Page): boolean {
  return fireEvent('success', { detail: { page } })
}
