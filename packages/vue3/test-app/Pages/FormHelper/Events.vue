<script setup lang="ts">
import { Errors, Page, PendingVisit, Progress } from '@inertiajs/core'
import { useForm, usePage } from '@inertiajs/vue3'
import type { CancelTokenSource } from 'axios'

declare global {
  interface Window {
    events: string[]
    data: {
      type: string
      data: unknown
      event: string | null
    }[]
  }
}

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

const page = usePage()

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
      onBefore: (visit: PendingVisit) => {
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
      onStart: (visit: PendingVisit) => {
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

const onCancelProcessing = () => {
  form.post('/sleep', {
    ...callbacks({
      onCancelToken: (token: CancelTokenSource) => {
        pushEvent('onCancelToken')
        pushData('onCancelToken', 'processing', form.processing)

        setTimeout(() => {
          token.cancel()
        }, 10)
      },
      onStart: () => {
        pushEvent('onStart')
        pushData('onStart', 'processing', form.processing)
      },
      onCancel: () => {
        pushEvent('onCancel')
        pushData('onCancel', 'processing', form.processing)
      },
      onFinish: () => {
        pushEvent('onFinish')
        pushData('onFinish', 'processing', form.processing)
      },
    }),
  })
}

const onCancelProgress = () => {
  form
    .transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    .post('/sleep', {
      ...callbacks({
        onCancelToken: (token: CancelTokenSource) => {
          pushEvent('onCancelToken')
          pushData('onCancelToken', 'progress', form.progress)

          setTimeout(() => {
            token.cancel()
          }, 10)
        },
        onStart: () => {
          pushEvent('onStart')
          pushData('onStart', 'progress', form.progress)
        },
        onProgress: () => {
          pushEvent('onProgress')
          pushData('onProgress', 'progress', form.progress)
        },
        onCancel: () => {
          pushEvent('onCancel')
          pushData('onCancel', 'progress', form.progress)
        },
        onFinish: () => {
          pushEvent('onFinish')
          pushData('onFinish', 'progress', form.progress)
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

<template>
  <div>
    <button @click.prevent="submit" class="submit">Submit form</button>

    <button @click.prevent="successfulRequest" class="successful-request">Successful request</button>
    <button @click.prevent="cancelledVisit" class="cancel">Cancellable Visit</button>

    <button @click.prevent="onBeforeVisit" class="before">onBefore</button>
    <button @click.prevent="onBeforeVisitCancelled" class="before-cancel">onBefore cancellation</button>
    <button @click.prevent="onStartVisit" class="start">onStart</button>
    <button @click.prevent="onProgressVisit" class="progress">onProgress</button>

    <button @click.prevent="onSuccessVisit" class="success">onSuccess</button>
    <button @click.prevent="onSuccessProgress" class="success-progress">onSuccess progress property</button>
    <button @click.prevent="onSuccessProcessing" class="success-processing">onSuccess resets processing</button>
    <button @click.prevent="onSuccessResetErrors" class="success-reset-errors">onSuccess resets errors</button>
    <button @click.prevent="onSuccessPromiseVisit" class="success-promise">onSuccess promise</button>
    <button @click.prevent="onSuccessResetValue" class="success-reset-value">onSuccess resets value</button>

    <button @click.prevent="onErrorVisit" class="error">onError</button>
    <button @click.prevent="onErrorProgress" class="error-progress">onError progress property</button>
    <button @click.prevent="onErrorProcessing" class="error-processing">onError resets processing</button>
    <button @click.prevent="errorsSetOnError" class="errors-set-on-error">Errors set on error</button>
    <button @click.prevent="onErrorPromiseVisit" class="error-promise">onError promise</button>

    <button @click.prevent="onCancelProcessing" class="cancel-processing">onCancel resets processing</button>
    <button @click.prevent="onCancelProgress" class="cancel-progress">onCancel progress property</button>

    <button @click.prevent="progressNoFiles" class="no-progress">progress no files</button>

    <span class="success-status">Form was {{ form.wasSuccessful ? '' : 'not ' }}successful</span>
    <span class="recently-status">Form was {{ form.recentlySuccessful ? '' : 'not ' }}recently successful</span>

    <input type="text" class="name-input" v-model="form.name" />
    <input type="checkbox" class="remember-input" v-model="form.remember" />
  </div>
</template>
