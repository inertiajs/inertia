import { useForm, usePage } from '@inertiajs/react'

export default (props) => {
  const form = useForm({ name: 'foo', remember: false })

  const page = usePage()

  const callbacks = (overrides = {}) => ({
    onBefore: () => alert('onBefore'),
    onCancelToken: () => alert('onCancelToken'),
    onStart: () => alert('onStart'),
    onProgress: () => alert('onProgress'),
    onFinish: () => alert('onFinish'),
    onCancel: () => alert('onCancel'),
    onSuccess: () => alert('onSuccess'),
    onError: () => alert('onError'),
    ...overrides,
  })

  const submit = () => {
    form.post(page.url)
  }

  const successfulRequest = () => {
    form.post(page.url, { ...callbacks() })
  }

  const onSuccessResetErrors = () => {
    form.post('/form-helper/events/errors', {
      onBefore: () => {
        alert('onBefore')
        alert(form.hasErrors)
      },
      onError: () => {
        alert('onError')
        alert(form.hasErrors)
        form.post('/form-helper/events', {
          onStart: () => {
            alert('onStart')
            alert(form.hasErrors)
            alert(form.errors)
          },
          onSuccess: () => {
            alert('onSuccess')
            alert(form.hasErrors)
            alert(form.errors)
          },
        })
      },
    })
  }

  const errorsSetOnError = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onStart: () => {
          alert('onStart')
          alert(form.errors)
        },
        onError: () => {
          alert('onError')
          alert(form.errors)
        },
      }),
    })
  }

  const onBeforeVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: (visit) => {
          alert('onBefore')
          alert(visit)
        },
      }),
    })
  }

  const onBeforeVisitCancelled = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: (visit) => {
          alert('onBefore')
          return false
        },
      }),
    })
  }

  const onStartVisit = () => {
    form.post('/form-helper/events', {
      ...callbacks({
        onStart: (visit) => {
          alert('onStart')
          alert(visit)
        },
      }),
    })
  }

  const onProgressVisit = () => {
    form.transform((data) => {
      console.log('transforming data', data)
      return { ...data, file: new File(['foobar'], 'example.bin') }
    })
    form.post('/dump/post', {
      ...callbacks({
        onProgress: (event) => {
          alert('onProgress')
          alert(event)
        },
      }),
    })
  }

  const cancelledVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onCancelToken: (token) => {
          alert('onCancelToken')
          setTimeout(() => {
            alert('CANCELLING!')
            token.cancel()
          }, 10)
        },
      }),
    })
  }

  const onSuccessVisit = () => {
    form.post('/dump/post', {
      ...callbacks({
        onSuccess: (page) => {
          alert('onSuccess')
          alert(page)
        },
      }),
    })
  }

  const onSuccessPromiseVisit = () => {
    form.post('/dump/post', {
      ...callbacks({
        onSuccess: (page) => {
          alert('onSuccess')
          setTimeout(() => alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise((resolve) => setTimeout(resolve, 20))
        },
      }),
    })
  }

  const onErrorVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: (errors) => {
          alert('onError')
          alert(errors)
        },
      }),
    })
  }

  const onErrorPromiseVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: (errors) => {
          alert('onError')
          setTimeout(() => alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise((resolve) => setTimeout(resolve, 20))
        },
      }),
    })
  }

  const onSuccessProcessing = () => {
    form.post(page.url, {
      ...callbacks({
        onBefore: () => {
          alert('onBefore')
          alert(form.processing)
        },
        onCancelToken: () => {
          alert('onCancelToken')
          alert(form.processing)
        },
        onStart: () => {
          alert('onStart')
          alert(form.processing)
        },
        onSuccess: () => {
          alert('onSuccess')
          alert(form.processing)
        },
        onFinish: () => {
          alert('onFinish')
          alert(form.processing)
        },
      }),
    })
  }

  const onErrorProcessing = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onBefore: () => {
          alert('onBefore')
          alert(form.processing)
        },
        onCancelToken: () => {
          alert('onCancelToken')
          alert(form.processing)
        },
        onStart: () => {
          alert('onStart')
          alert(form.processing)
        },
        onError: () => {
          alert('onError')
          alert(form.processing)
        },
        onFinish: () => {
          alert('onFinish')
          alert(form.processing)
        },
      }),
    })
  }

  const onSuccessProgress = () => {
    form.transform((data) => ({ ...data, file: new File(['foobar'], 'example.bin') }))
    form.post(page.url, {
      ...callbacks({
        onBefore: () => {
          alert('onBefore')
          alert(form.progress)
        },
        onCancelToken: () => {
          alert('onCancelToken')
          alert(form.progress)
        },
        onStart: () => {
          alert('onStart')
          alert(form.progress)
        },
        onProgress: () => {
          alert('onProgress')
          alert(form.progress)
        },
        onSuccess: () => {
          alert('onSuccess')
          alert(form.progress)
        },
        onFinish: () => {
          alert('onFinish')
          alert(form.progress)
        },
      }),
    })
  }

  const onErrorProgress = () => {
    form.transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onBefore: () => {
          alert('onBefore')
          alert(form.progress)
        },
        onCancelToken: () => {
          alert('onCancelToken')
          alert(form.progress)
        },
        onStart: () => {
          alert('onStart')
          alert(form.progress)
        },
        onProgress: () => {
          alert('onProgress')
          alert(form.progress)
        },
        onError: () => {
          alert('onError')
          alert(form.progress)
        },
        onFinish: () => {
          alert('onFinish')
          alert(form.progress)
        },
      }),
    })
  }

  const progressNoFiles = () => {
    form.post(page.url, {
      ...callbacks({
        onBefore: () => {
          alert('onBefore')
          alert(form.progress)
        },
        onCancelToken: () => {
          alert('onCancelToken')
          alert(form.progress)
        },
        onStart: () => {
          alert('onStart')
          alert(form.progress)
        },
        onProgress: () => {
          alert('onProgress')
          alert(form.progress)
        },
        onSuccess: () => {
          alert('onSuccess')
          alert(form.progress)
        },
        onFinish: () => {
          alert('onFinish')
          alert(form.progress)
        },
      }),
    })
  }

  return (
    <div>
      <span onClick={submit} className="submit">
        Submit form
      </span>

      <span onClick={successfulRequest} className="successful-request">
        Successful request
      </span>
      <span onClick={cancelledVisit} className="cancel">
        Cancellable Visit
      </span>

      <span onClick={onBeforeVisit} className="before">
        onBefore
      </span>
      <span onClick={onBeforeVisitCancelled} className="before-cancel">
        onBefore cancellation
      </span>
      <span onClick={onStartVisit} className="start">
        onStart
      </span>
      <span onClick={onProgressVisit} className="progress">
        onProgress
      </span>

      <span onClick={onSuccessVisit} className="success">
        onSuccess
      </span>
      <span onClick={onSuccessProgress} className="success-progress">
        onSuccess progress property
      </span>
      <span onClick={onSuccessProcessing} className="success-processing">
        onSuccess resets processing
      </span>
      <span onClick={onSuccessResetErrors} className="success-reset-errors">
        onSuccess resets errors
      </span>
      <span onClick={onSuccessPromiseVisit} className="success-promise">
        onSuccess promise
      </span>

      <span onClick={onErrorVisit} className="error">
        onError
      </span>
      <span onClick={onErrorProgress} className="error-progress">
        onError progress property
      </span>
      <span onClick={onErrorProcessing} className="error-processing">
        onError resets processing
      </span>
      <span onClick={errorsSetOnError} className="errors-set-on-error">
        Errors set on error
      </span>
      <span onClick={onErrorPromiseVisit} className="error-promise">
        onError promise
      </span>

      <span onClick={progressNoFiles} className="no-progress">
        progress no files
      </span>

      <span className="success-status">Form was {form.wasSuccessful ? '' : 'not '}successful</span>
      <span className="recently-status">Form was {form.recentlySuccessful ? '' : 'not '}recently successful</span>
    </div>
  )
}
