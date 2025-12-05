import { GlobalEventDetails, GlobalEventNames, GlobalEventTrigger } from './types'

function fireEvent<TEventName extends GlobalEventNames>(
  name: TEventName,
  options: CustomEventInit<GlobalEventDetails<TEventName>>,
): boolean {
  return document.dispatchEvent(new CustomEvent(`inertia:${name}`, options))
}

export const fireBeforeEvent: GlobalEventTrigger<'before'> = (visit) => {
  return fireEvent('before', { cancelable: true, detail: { visit } })
}

export const fireErrorEvent: GlobalEventTrigger<'error'> = (errors) => {
  return fireEvent('error', { detail: { errors } })
}

export const fireExceptionEvent: GlobalEventTrigger<'exception'> = (exception) => {
  return fireEvent('exception', { cancelable: true, detail: { exception } })
}

export const fireFinishEvent: GlobalEventTrigger<'finish'> = (visit) => {
  return fireEvent('finish', { detail: { visit } })
}

export const fireInvalidEvent: GlobalEventTrigger<'invalid'> = (response) => {
  return fireEvent('invalid', { cancelable: true, detail: { response } })
}

export const fireBeforeUpdateEvent: GlobalEventTrigger<'beforeUpdate'> = (page) => {
  return fireEvent('beforeUpdate', { detail: { page } })
}

export const fireNavigateEvent: GlobalEventTrigger<'navigate'> = (page) => {
  return fireEvent('navigate', { detail: { page } })
}

export const fireProgressEvent: GlobalEventTrigger<'progress'> = (progress) => {
  return fireEvent('progress', { detail: { progress } })
}

export const fireStartEvent: GlobalEventTrigger<'start'> = (visit) => {
  return fireEvent('start', { detail: { visit } })
}

export const fireSuccessEvent: GlobalEventTrigger<'success'> = (page) => {
  return fireEvent('success', { detail: { page } })
}

export const firePrefetchedEvent: GlobalEventTrigger<'prefetched'> = (response, visit) => {
  return fireEvent('prefetched', { detail: { fetchedAt: Date.now(), response: response.data, visit } })
}

export const firePrefetchingEvent: GlobalEventTrigger<'prefetching'> = (visit) => {
  return fireEvent('prefetching', { detail: { visit } })
}

export const fireFlashEvent: GlobalEventTrigger<'flash'> = (flash) => {
  return fireEvent('flash', { detail: { flash } })
}
