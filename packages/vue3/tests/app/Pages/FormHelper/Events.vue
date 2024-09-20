<script setup>
import { useForm, usePage } from '@inertiajs/vue3'

window.messages = []

const form = useForm({
  name: 'foo',
  remember: false,
})

const pushMessage = (message) => {
  window.messages.push(message)
}

const page = usePage()

const callbacks = (overrides = {}) => {
  const defaults = {
    onBefore: () => pushMessage('onBefore'),
    onCancelToken: () => pushMessage('onCancelToken'),
    onStart: () => pushMessage('onStart'),
    onProgress: () => pushMessage('onProgress'),
    onFinish: () => pushMessage('onFinish'),
    onCancel: () => pushMessage('onCancel'),
    onSuccess: () => pushMessage('onSuccess'),
    onError: () => pushMessage('onError'),
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
    onBefore: () => {
      pushMessage('onBefore')
      pushMessage(form.hasErrors)
    },
    onError: () => {
      pushMessage('onError')
      pushMessage(form.hasErrors)

      form.post('/form-helper/events', {
        onStart: () => {
          pushMessage('onStart')
          pushMessage(form.hasErrors)
          pushMessage(form.errors)
        },
        onSuccess: () => {
          pushMessage('onSuccess')
          pushMessage(form.hasErrors)
          pushMessage(form.errors)
        },
      })
    },
  })
}

const errorsSetOnError = () => {
  form.post('/form-helper/events/errors', {
    ...callbacks({
      onStart: () => {
        pushMessage('onStart')
        pushMessage(form.errors)
      },
      onError: () => {
        pushMessage('onError')
        pushMessage(form.errors)
      },
    }),
  })
}

const onBeforeVisit = () => {
  form.post('/sleep', {
    ...callbacks({
      onBefore: (visit) => {
        pushMessage('onBefore')
        pushMessage(visit)
      },
    }),
  })
}

const onBeforeVisitCancelled = () => {
  form.post('/sleep', {
    ...callbacks({
      onBefore: (visit) => {
        pushMessage('onBefore')
        return false
      },
    }),
  })
}

const onStartVisit = () => {
  form.post('/form-helper/events', {
    ...callbacks({
      onStart: (visit) => {
        pushMessage('onStart')
        pushMessage(visit)
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
        onProgress: (event) => {
          pushMessage('onProgress')
          pushMessage(event)
        },
      }),
    })
}

const cancelledVisit = () => {
  form.post('/sleep', {
    ...callbacks({
      onCancelToken: (token) => {
        pushMessage('onCancelToken')

        setTimeout(() => {
          pushMessage('CANCELLING!')
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
        pushMessage('onSuccess')
        pushMessage(page)
      },
    }),
  })
}

const onSuccessPromiseVisit = () => {
  form.post('/dump/post', {
    ...callbacks({
      onSuccess: (page) => {
        pushMessage('onSuccess')

        setTimeout(() => pushMessage('onFinish should have been fired by now if Promise functionality did not work'), 5)
        return new Promise((resolve) => setTimeout(resolve, 20))
      },
    }),
  })
}

const onErrorVisit = () => {
  form.post('/form-helper/events/errors', {
    ...callbacks({
      onError: (errors) => {
        pushMessage('onError')
        pushMessage(errors)
      },
    }),
  })
}

const onErrorPromiseVisit = () => {
  form.post('/form-helper/events/errors', {
    ...callbacks({
      onError: (errors) => {
        pushMessage('onError')

        setTimeout(() => pushMessage('onFinish should have been fired by now if Promise functionality did not work'), 5)
        return new Promise((resolve) => setTimeout(resolve, 20))
      },
    }),
  })
}

const onSuccessProcessing = () => {
  form.post(page.url, {
    ...callbacks({
      onBefore: () => {
        pushMessage('onBefore')
        pushMessage(form.processing)
      },
      onCancelToken: () => {
        pushMessage('onCancelToken')
        pushMessage(form.processing)
      },
      onStart: () => {
        pushMessage('onStart')
        pushMessage(form.processing)
      },
      onSuccess: () => {
        pushMessage('onSuccess')
        pushMessage(form.processing)
      },
      onFinish: () => {
        pushMessage('onFinish')
        pushMessage(form.processing)
      },
    }),
  })
}

const onErrorProcessing = () => {
  form.post('/form-helper/events/errors', {
    ...callbacks({
      onBefore: () => {
        pushMessage('onBefore')
        pushMessage(form.processing)
      },
      onCancelToken: () => {
        pushMessage('onCancelToken')
        pushMessage(form.processing)
      },
      onStart: () => {
        pushMessage('onStart')
        pushMessage(form.processing)
      },
      onError: () => {
        pushMessage('onError')
        pushMessage(form.processing)
      },
      onFinish: () => {
        pushMessage('onFinish')
        pushMessage(form.processing)
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
    .post(page.url, {
      ...callbacks({
        onBefore: () => {
          pushMessage('onBefore')
          pushMessage(form.progress)
        },
        onCancelToken: () => {
          pushMessage('onCancelToken')
          pushMessage(form.progress)
        },
        onStart: () => {
          pushMessage('onStart')
          pushMessage(form.progress)
        },
        onProgress: () => {
          pushMessage('onProgress')
          pushMessage(form.progress)
        },
        onSuccess: () => {
          pushMessage('onSuccess')
          pushMessage(form.progress)
        },
        onFinish: () => {
          pushMessage('onFinish')
          pushMessage(form.progress)
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
          pushMessage('onBefore')
          pushMessage(form.progress)
        },
        onCancelToken: () => {
          pushMessage('onCancelToken')
          pushMessage(form.progress)
        },
        onStart: () => {
          pushMessage('onStart')
          pushMessage(form.progress)
        },
        onProgress: () => {
          pushMessage('onProgress')
          pushMessage(form.progress)
        },
        onError: () => {
          pushMessage('onError')
          pushMessage(form.progress)
        },
        onFinish: () => {
          pushMessage('onFinish')
          pushMessage(form.progress)
        },
      }),
    })
}

const progressNoFiles = () => {
  form.post(page.url, {
    ...callbacks({
      onBefore: () => {
        pushMessage('onBefore')
        pushMessage(form.progress)
      },
      onCancelToken: () => {
        pushMessage('onCancelToken')
        pushMessage(form.progress)
      },
      onStart: () => {
        pushMessage('onStart')
        pushMessage(form.progress)
      },
      onProgress: () => {
        pushMessage('onProgress')
        pushMessage(form.progress)
      },
      onSuccess: () => {
        pushMessage('onSuccess')
        pushMessage(form.progress)
      },
      onFinish: () => {
        pushMessage('onFinish')
        pushMessage(form.progress)
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

    <button @click.prevent="onErrorVisit" class="error">onError</button>
    <button @click.prevent="onErrorProgress" class="error-progress">onError progress property</button>
    <button @click.prevent="onErrorProcessing" class="error-processing">onError resets processing</button>
    <button @click.prevent="errorsSetOnError" class="errors-set-on-error">Errors set on error</button>
    <button @click.prevent="onErrorPromiseVisit" class="error-promise">onError promise</button>

    <button @click.prevent="progressNoFiles" class="no-progress">progress no files</button>

    <span class="success-status">Form was {{ form.wasSuccessful ? '' : 'not ' }}successful</span>
    <span class="recently-status">Form was {{ form.recentlySuccessful ? '' : 'not ' }}recently successful</span>
  </div>
</template>
