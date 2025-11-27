<script module lang="ts">
  declare global {
    interface Window {
      events: string[]
      data: Array<{ type: string; data: unknown; event: string | null }>
    }
  }
</script>

<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { page, useForm } from '@inertiajs/svelte'
  import type { ActiveVisit, Page, Progress, Errors } from '@inertiajs/core'
  import type { CancelTokenSource } from 'axios'

  window.events = []
  window.data = []

  const form = useForm({
    name: 'foo',
    remember: false,
  })

  const pushEvent = (message: string) => {
    window.events.push(message)
  }

  const pushData = (event: string | null, type: string, data: unknown) => {
    window.data.push({
      type,
      data,
      event,
    })
  }

  pushData(null, 'processing', form.processing)
  pushData(null, 'progress', form.progress)
  pushData(null, 'errors', form.errors)

  const callbacks = (overrides = {}) => {
    const defaults = {
      onBefore: () => pushEvent('onBefore'),
      onCancelToken: () => pushEvent('onCancelToken'),
      onStart: () => pushEvent('onStart'),
      onProgress: () => pushEvent('onProgress'),
      onFinish: () => pushEvent('onFinish'),
      onCancel: () => pushEvent('onCancel'),
      onSuccess: () => pushEvent('onSuccess'),
      onError: () => pushEvent('onError'),
    }

    return {
      ...defaults,
      ...overrides,
    }
  }

  const submit = () => {
    form.post(page.url)
  }

  const successfulRequest = () => {
    form.post(page.url, {
      ...callbacks(),
    })
  }

  const onSuccessResetErrors = () => {
    form.post('/form-helper/events/errors', {
      onError: () => {
        pushEvent('onError')

        form.post('/form-helper/events', {
          ...callbacks({
            onStart: () => {
              pushEvent('onStart')
              pushData('onStart', 'errors', form.errors)
            },
            onSuccess: () => {
              pushEvent('onSuccess')
              pushData('onSuccess', 'errors', form.errors)
            },
            onFinish: () => {
              pushEvent('onFinish')
              pushData('onFinish', 'errors', form.errors)
            },
          }),
        })
      },
    })
  }

  const errorsSetOnError = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onStart: () => {
          pushEvent('onStart')
          pushData('onStart', 'errors', form.errors)
        },
        onError: () => {
          pushEvent('onError')
          pushData('onError', 'errors', form.errors)
        },
        onFinish: () => {
          pushEvent('onFinish')
          pushData('onFinish', 'errors', form.errors)
        },
      }),
    })
  }

  const onBeforeVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: (visit: ActiveVisit) => {
          pushEvent('onBefore')
          pushData('onBefore', 'visit', visit)
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
        onStart: (visit: ActiveVisit) => {
          pushEvent('onStart')
          pushData('onStart', 'visit', visit)
        },
      }),
    })
  }

  const onProgressVisit = () => {
    form
      .transform((data) => ({
        ...data,
        file: new File(['foobar'], 'example.bin'),
      }))
      .post('/dump/post', {
        ...callbacks({
          onProgress: (event: Progress) => {
            pushEvent('onProgress')
            pushData('onProgress', 'progressEvent', event)
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
          pushData('onSuccess', 'page', page)
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

  const onSuccessResetValue = () => {
    form.post(page.url, {
      ...callbacks({
        onSuccess: () => {
          form.reset()
        },
      }),
    })
  }

  const onErrorVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: (errors: Errors) => {
          pushEvent('onError')
          pushData('onError', 'errors', errors)
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
    form.post(page.url, {
      ...callbacks({
        onBefore: () => {
          pushEvent('onBefore')
          pushData('onBefore', 'processing', form.processing)
        },
        onCancelToken: () => {
          pushEvent('onCancelToken')
          pushData('onCancelToken', 'processing', form.processing)
        },
        onStart: () => {
          pushEvent('onStart')
          pushData('onStart', 'processing', form.processing)
        },
        onSuccess: () => {
          pushEvent('onSuccess')
          pushData('onSuccess', 'processing', form.processing)
        },
        onFinish: () => {
          pushEvent('onFinish')
          pushData('onFinish', 'processing', form.processing)
        },
      }),
    })
  }

  const onErrorProcessing = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onBefore: () => {
          pushEvent('onBefore')
          pushData('onBefore', 'processing', form.processing)
        },
        onCancelToken: () => {
          pushEvent('onCancelToken')
          pushData('onCancelToken', 'processing', form.processing)
        },
        onStart: () => {
          pushEvent('onStart')
          pushData('onStart', 'processing', form.processing)
        },
        onError: () => {
          pushEvent('onError')
          pushData('onError', 'processing', form.processing)
        },
        onFinish: () => {
          pushEvent('onFinish')
          pushData('onFinish', 'processing', form.processing)
        },
      }),
    })
  }

  const onSuccessProgress = () => {
    form
      .transform((data) => ({
        ...data,
        file: new File(['foobar'], 'example.bin'),
      }))
      .post('/sleep', {
        ...callbacks({
          onBefore: () => {
            pushEvent('onBefore')
            pushData('onBefore', 'progress', form.progress)
          },
          onCancelToken: () => {
            pushEvent('onCancelToken')
            pushData('onCancelToken', 'progress', form.progress)
          },
          onStart: () => {
            pushEvent('onStart')
            pushData('onStart', 'progress', form.progress)
          },
          onProgress: () => {
            pushEvent('onProgress')
            pushData('onProgress', 'progress', form.progress)
          },
          onSuccess: () => {
            pushEvent('onSuccess')
            pushData('onSuccess', 'progress', form.progress)
          },
          onFinish: () => {
            pushEvent('onFinish')
            pushData('onFinish', 'progress', form.progress)
          },
        }),
      })
  }

  const onErrorProgress = () => {
    form
      .transform((data) => ({
        ...data,
        file: new File(['foobar'], 'example.bin'),
      }))
      .post('/form-helper/events/errors', {
        ...callbacks({
          onBefore: () => {
            pushEvent('onBefore')
            pushData('onBefore', 'progress', form.progress)
          },
          onCancelToken: () => {
            pushEvent('onCancelToken')
            pushData('onCancelToken', 'progress', form.progress)
          },
          onStart: () => {
            pushEvent('onStart')
            pushData('onStart', 'progress', form.progress)
          },
          onProgress: () => {
            pushEvent('onProgress')
            pushData('onProgress', 'progress', form.progress)
          },
          onError: () => {
            pushEvent('onError')
            pushData('onError', 'progress', form.progress)
          },
          onFinish: () => {
            pushEvent('onFinish')
            pushData('onFinish', 'progress', form.progress)
          },
        }),
      })
  }

  const progressNoFiles = () => {
    form.post(page.url, {
      ...callbacks({
        onBefore: () => {
          pushEvent('onBefore')
          pushData('onBefore', 'progress', form.progress)
        },
        onCancelToken: () => {
          pushEvent('onCancelToken')
          pushData('onCancelToken', 'progress', form.progress)
        },
        onStart: () => {
          pushEvent('onStart')
          pushData('onStart', 'progress', form.progress)
        },
        onProgress: () => {
          pushEvent('onProgress')
          pushData('onProgress', 'progress', form.progress)
        },
        onSuccess: () => {
          pushEvent('onSuccess')
          pushData('onSuccess', 'progress', form.progress)
        },
        onFinish: () => {
          pushEvent('onFinish')
          pushData('onFinish', 'progress', form.progress)
        },
      }),
    })
  }
</script>

<div>
  <button onclick={preventDefault(submit)} class="submit">Submit form</button>

  <button onclick={preventDefault(successfulRequest)} class="successful-request">Successful request</button>
  <button onclick={preventDefault(cancelledVisit)} class="cancel">Cancellable Visit</button>

  <button onclick={preventDefault(onBeforeVisit)} class="before">onBefore</button>
  <button onclick={preventDefault(onBeforeVisitCancelled)} class="before-cancel">onBefore cancellation</button>
  <button onclick={preventDefault(onStartVisit)} class="start">onStart</button>
  <button onclick={preventDefault(onProgressVisit)} class="progress">onProgress</button>

  <button onclick={preventDefault(onSuccessVisit)} class="success">onSuccess</button>
  <button onclick={preventDefault(onSuccessProgress)} class="success-progress">onSuccess progress property</button>
  <button onclick={preventDefault(onSuccessProcessing)} class="success-processing">onSuccess resets processing</button>
  <button onclick={preventDefault(onSuccessResetErrors)} class="success-reset-errors">onSuccess resets errors</button>
  <button onclick={preventDefault(onSuccessPromiseVisit)} class="success-promise">onSuccess promise</button>
  <button onclick={preventDefault(onSuccessResetValue)} class="success-reset-value">onSuccess resets value</button>

  <button onclick={preventDefault(onErrorVisit)} class="error">onError</button>
  <button onclick={preventDefault(onErrorProgress)} class="error-progress">onError progress property</button>
  <button onclick={preventDefault(onErrorProcessing)} class="error-processing">onError resets processing</button>
  <button onclick={preventDefault(errorsSetOnError)} class="errors-set-on-error">Errors set on error</button>
  <button onclick={preventDefault(onErrorPromiseVisit)} class="error-promise">onError promise</button>

  <button onclick={preventDefault(progressNoFiles)} class="no-progress">progress no files</button>

  <span class="success-status">Form was {form.wasSuccessful ? '' : 'not '}successful</span>
  <span class="recently-status">Form was {form.recentlySuccessful ? '' : 'not '}recently successful</span>

  <input type="text" class="name-input" bind:value={form.name} />
  <input type="checkbox" class="remember-input" bind:checked={form.remember} />
</div>
