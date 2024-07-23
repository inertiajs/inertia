<script setup>
import { useForm, usePage } from '@inertiajs/vue3'

const form = useForm({
  name: 'foo',
  remember: false,
})

const page = usePage()

const callbacks = (overrides = {}) => {
  const defaults = {
    onBefore: () => alert('onBefore'),
    onCancelToken: () => alert('onCancelToken'),
    onStart: () => alert('onStart'),
    onProgress: () => alert('onProgress'),
    onFinish: () => alert('onFinish'),
    onCancel: () => alert('onCancel'),
    onSuccess: () => alert('onSuccess'),
    onError: () => alert('onError'),
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
  form
    .transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    .post('/dump/post', {
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
  form
    .transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    .post(page.url, {
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
  form
    .transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    .post('/form-helper/events/errors', {
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
</script>

<template>
  <div>
    <span @click="submit" class="submit">Submit form</span>

    <span @click="successfulRequest" class="successful-request">Successful request</span>
    <span @click="cancelledVisit" class="cancel">Cancellable Visit</span>

    <span @click="onBeforeVisit" class="before">onBefore</span>
    <span @click="onBeforeVisitCancelled" class="before-cancel">onBefore cancellation</span>
    <span @click="onStartVisit" class="start">onStart</span>
    <span @click="onProgressVisit" class="progress">onProgress</span>

    <span @click="onSuccessVisit" class="success">onSuccess</span>
    <span @click="onSuccessProgress" class="success-progress">onSuccess progress property</span>
    <span @click="onSuccessProcessing" class="success-processing">onSuccess resets processing</span>
    <span @click="onSuccessResetErrors" class="success-reset-errors">onSuccess resets errors</span>
    <span @click="onSuccessPromiseVisit" class="success-promise">onSuccess promise</span>

    <span @click="onErrorVisit" class="error">onError</span>
    <span @click="onErrorProgress" class="error-progress">onError progress property</span>
    <span @click="onErrorProcessing" class="error-processing">onError resets processing</span>
    <span @click="errorsSetOnError" class="errors-set-on-error">Errors set on error</span>
    <span @click="onErrorPromiseVisit" class="error-promise">onError promise</span>

    <span @click="progressNoFiles" class="no-progress">progress no files</span>

    <span class="success-status">Form was {{ form.wasSuccessful ? '' : 'not ' }}successful</span>
    <span class="recently-status">Form was {{ form.recentlySuccessful ? '' : 'not ' }}recently successful</span>
  </div>
</template>
