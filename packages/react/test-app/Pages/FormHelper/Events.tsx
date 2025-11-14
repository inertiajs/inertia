import type { Errors, Page, PendingVisit } from '@inertiajs/core'
import { useForm, usePage } from '@inertiajs/react'
import type { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { useEffect } from 'react'

declare global {
  interface Window {
    events: string[]
    data: Array<{ type: string; data: unknown; event: string | null }>
  }
}

window.events = []
window.data = []

const pushEvent = (message: string) => {
  window.events.push(message)
}

const pushData = (type: string, data: unknown) => {
  const currentEvent = window.events[window.events.length - 1] ?? null

  window.data.push({
    type,
    data,
    event: currentEvent,
  })
}

const callbacks = (overrides = {}) => ({
  onBefore: () => pushEvent('onBefore'),
  onCancelToken: () => pushEvent('onCancelToken'),
  onStart: () => pushEvent('onStart'),
  onProgress: () => pushEvent('onProgress'),
  onFinish: () => pushEvent('onFinish'),
  onCancel: () => pushEvent('onCancel'),
  onSuccess: () => pushEvent('onSuccess'),
  onError: () => pushEvent('onError'),
  ...overrides,
})

export default () => {
  const form = useForm({ name: 'foo', remember: false })

  const page = usePage()

  useEffect(() => {
    pushData('processing', form.processing)
  }, [form.processing])

  useEffect(() => {
    pushData('progress', form.progress)
  }, [form.progress])

  useEffect(() => {
    pushData('errors', form.errors)
  }, [form.errors])

  useEffect(() => {
    pushData('hasErrors', form.hasErrors)
  }, [form.hasErrors])

  const submit = () => {
    form.post(page.url)
  }

  const successfulRequest = () => {
    form.post(page.url, { ...callbacks() })
  }

  const onSuccessResetErrors = () => {
    form.post('/form-helper/events/errors', {
      onError: (errors: Errors) => {
        pushEvent('onError')
        form.post('/form-helper/events', {
          ...callbacks({
            onStart: () => {
              pushEvent('onStart')
              pushData('errors', errors)
            },
            onSuccess: () => {
              pushEvent('onSuccess')
              pushData('errors', form.errors)
            },
            onFinish: () => {
              pushEvent('onFinish')
              pushData('errors', form.errors)
            },
          }),
        })
      },
    })
  }

  const errorsSetOnError = () => {
    form.post('/form-helper/events/errors', callbacks())
  }

  const onBeforeVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: (visit: PendingVisit) => {
          pushEvent('onBefore')
          pushData('visit', visit)
        },
      }),
    })
  }

  const onBeforeVisitCancelled = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: () => {
          pushEvent('onBefore')
          return false
        },
      }),
    })
  }

  const onStartVisit = () => {
    form.post('/form-helper/events', {
      ...callbacks({
        onStart: (visit: PendingVisit) => {
          pushEvent('onStart')
          pushData('visit', visit)
        },
      }),
    })
  }

  const onProgressVisit = () => {
    form.transform((data) => {
      return { ...data, file: new File(['foobar'], 'example.bin') }
    })

    form.post('/dump/post', {
      ...callbacks({
        onProgress: (event: AxiosProgressEvent) => {
          pushEvent('onProgress')
          pushData('progressEvent', event)
        },
      }),
    })
  }

  const cancelledVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onCancelToken: (token: CancelTokenSource) => {
          pushEvent('onCancelToken')
          setTimeout(() => {
            pushEvent('CANCELLING!')
            token.cancel()
          }, 10)
        },
      }),
    })
  }

  const onSuccessVisit = () => {
    form.post('/dump/post', {
      ...callbacks({
        onSuccess: (page: Page) => {
          pushEvent('onSuccess')
          pushData('page', page)
        },
      }),
    })
  }

  const onSuccessPromiseVisit = () => {
    form.post('/dump/post', {
      ...callbacks({
        onSuccess: () => {
          pushEvent('onSuccess')
          setTimeout(() => pushEvent('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise((resolve) => setTimeout(resolve, 20))
        },
      }),
    })
  }

  const onErrorVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: (errors: Errors) => {
          pushEvent('onError')
          pushData('errors', errors)
        },
      }),
    })
  }

  const onErrorPromiseVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: () => {
          pushEvent('onError')
          setTimeout(() => pushEvent('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise((resolve) => setTimeout(resolve, 20))
        },
      }),
    })
  }

  const onSuccessProcessing = () => {
    form.post(page.url, callbacks())
  }

  const onSuccessResetValue = () => {
    form.post(page.url, {
      ...callbacks({
        onSuccess: () => {
          form.reset()
        },
      }),
    })
  }

  const onErrorProcessing = () => {
    form.post('/form-helper/events/errors', callbacks())
  }

  const onSuccessProgress = () => {
    form.transform((data) => ({ ...data, file: new File(['foo'], 'example.bin') }))
    form.post('/sleep', callbacks())
  }

  const onErrorProgress = () => {
    form.transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    form.post('/form-helper/events/errors', callbacks())
  }

  const progressNoFiles = () => {
    form.post(page.url, callbacks())
  }

  return (
    <div>
      <button onClick={submit} className="submit">
        Submit form
      </button>

      <button onClick={successfulRequest} className="successful-request">
        Successful request
      </button>
      <button onClick={cancelledVisit} className="cancel">
        Cancellable Visit
      </button>

      <button onClick={onBeforeVisit} className="before">
        onBefore
      </button>
      <button onClick={onBeforeVisitCancelled} className="before-cancel">
        onBefore cancellation
      </button>
      <button onClick={onStartVisit} className="start">
        onStart
      </button>
      <button onClick={onProgressVisit} className="progress">
        onProgress
      </button>

      <button onClick={onSuccessVisit} className="success">
        onSuccess
      </button>
      <button onClick={onSuccessProgress} className="success-progress">
        onSuccess progress property
      </button>
      <button onClick={onSuccessProcessing} className="success-processing">
        onSuccess resets processing
      </button>
      <button onClick={onSuccessResetErrors} className="success-reset-errors">
        onSuccess resets errors
      </button>
      <button onClick={onSuccessPromiseVisit} className="success-promise">
        onSuccess promise
      </button>
      <button onClick={onSuccessResetValue} className="success-reset-value">
        onSuccess resets value
      </button>

      <button onClick={onErrorVisit} className="error">
        onError
      </button>
      <button onClick={onErrorProgress} className="error-progress">
        onError progress property
      </button>
      <button onClick={onErrorProcessing} className="error-processing">
        onError resets processing
      </button>
      <button onClick={errorsSetOnError} className="errors-set-on-error">
        Errors set on error
      </button>
      <button onClick={onErrorPromiseVisit} className="error-promise">
        onError promise
      </button>

      <button onClick={progressNoFiles} className="no-progress">
        progress no files
      </button>

      <span className="success-status">Form was {form.wasSuccessful ? '' : 'not '}successful</span>
      <span className="recently-status">Form was {form.recentlySuccessful ? '' : 'not '}recently successful</span>

      <input
        type="text"
        className="name-input"
        value={form.data.name}
        onChange={(e) => form.setData('name', e.target.value)}
      />
      <input
        type="checkbox"
        className="remember-input"
        checked={form.data.remember}
        onChange={(e) => form.setData('remember', e.target.checked)}
      />
    </div>
  )
}
