function fireEvent(name, options) {
  return document.dispatchEvent(
    new CustomEvent(`inertia:${name}`, options),
  )
}

export function fireBeforeEvent(visit) {
  return fireEvent('before', { cancelable: true, detail: { visit } } )
}

export function fireErrorEvent(errors) {
  return fireEvent('error', { detail: { errors } })
}

export function fireExceptionEvent(exception) {
  return fireEvent('exception', { cancelable: true, detail: { exception } })
}

export function fireFinishEvent(visit) {
  return fireEvent('finish', { detail: { visit } } )
}

export function fireInvalidEvent(response) {
  return fireEvent('invalid', { cancelable: true, detail: { response } })
}

export function fireNavigateEvent(page) {
  return fireEvent('navigate', { detail: { page } })
}

export function fireProgressEvent(progress) {
  return fireEvent('progress', { detail: { progress } })
}

export function fireStartEvent(visit) {
  return fireEvent('start', { detail: { visit } } )
}

export function fireSuccessEvent(page) {
  return fireEvent('success', { detail: { page } })
}
