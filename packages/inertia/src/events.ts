import { AxiosError } from 'axios'

import { InertiaProgressEvent, Page, Visit } from './inertia'

export type InertiaEvents = {
  before: CustomEvent<Visit>
  start: CustomEvent<Visit>
  progress: CustomEvent<InertiaProgressEvent>
  success: CustomEvent<Page>
  finish: CustomEvent<Visit>
  invalid: CustomEvent<AxiosError['response']>
  error: CustomEvent<AxiosError>
  navigate: CustomEvent<Page>
}

function fireEvent<T>(name: string, options: CustomEventInit<T>) {
  return document.dispatchEvent(
    new CustomEvent(`inertia:${name}`, options),
  )
}

export function fireBeforeEvent(visit: Visit) {
  return fireEvent('before', { cancelable: true, detail: { visit } } )
}

export function fireErrorEvent(error: AxiosError) {
  return fireEvent('error', { cancelable: true, detail: { error } })
}

export function fireFinishEvent(visit: Visit) {
  return fireEvent('finish', { detail: { visit } } )
}

export function fireInvalidEvent(response: AxiosError['response']) {
  return fireEvent('invalid', { cancelable: true, detail: { response } })
}

export function fireNavigateEvent(page: Page) {
  return fireEvent('navigate', { detail: { page } })
}

export function fireProgressEvent(progress: InertiaProgressEvent) {
  return fireEvent('progress', { detail: { progress } })
}

export function fireStartEvent(visit: Visit) {
  return fireEvent('start', { detail: { visit } } )
}

export function fireSuccessEvent(page: Page) {
  return fireEvent('success', { detail: { page } })
}
