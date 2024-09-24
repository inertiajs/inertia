<script setup>
import { Link, router, usePage } from '@inertiajs/vue3'

const payloadWithFile = {
  file: new File(['foobar'], 'example.bin'),
}

const page = usePage()

window.messages = []

const internalAlert = (...args) => {
  window.messages.push(...args)
}

const withoutEventListeners = () => {
  router.post(page.url, {})
}

const removeInertiaListener = () => {
  const removeEventListener = router.on('before', () => internalAlert('Inertia.on(before)'))

  internalAlert('Removing Inertia.on Listener')
  removeEventListener()

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('onBefore'),
      onStart: () => internalAlert('onStart'),
    },
  )
}

const beforeVisit = () => {
  router.on('before', (event) => {
    internalAlert('Inertia.on(before)')
    internalAlert(event)
  })

  document.addEventListener('inertia:before', (event) => {
    internalAlert('addEventListener(inertia:before)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onBefore: (event) => {
        internalAlert('onBefore')
        internalAlert(event)
      },
      onStart: () => internalAlert('onStart'),
    },
  )
}

const beforeVisitPreventLocal = () => {
  document.addEventListener('inertia:before', () => internalAlert('addEventListener(inertia:before)'))
  router.on('before', () => internalAlert('Inertia.on(before)'))

  router.post(
    page.url,
    {},
    {
      onBefore: () => {
        internalAlert('onBefore')
        return false
      },
      onStart: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const beforeVisitPreventGlobalInertia = () => {
  document.addEventListener('inertia:before', () => internalAlert('addEventListener(inertia:before)'))
  router.on('before', (visit) => {
    internalAlert('Inertia.on(before)')
    return false
  })

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('onBefore'),
      onStart: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const beforeVisitPreventGlobalNative = () => {
  router.on('before', () => internalAlert('Inertia.on(before)'))
  document.addEventListener('inertia:before', (event) => {
    internalAlert('addEventListener(inertia:before)')
    event.preventDefault()
  })

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('onBefore'),
      onStart: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const cancelTokenVisit = () => {
  router.on('cancelToken', () => internalAlert('This listener should not have been called.'))
  document.addEventListener('inertia:cancelToken', () => internalAlert('This listener should not have been called.'))

  router.post(
    page.url,
    {},
    {
      onCancelToken: (event) => {
        internalAlert('onCancelToken')
        internalAlert(event)
      },
    },
  )
}

const startVisit = () => {
  router.on('start', (event) => {
    internalAlert('Inertia.on(start)')
    internalAlert(event)
  })

  document.addEventListener('inertia:start', (event) => {
    internalAlert('addEventListener(inertia:start)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onStart: (event) => {
        internalAlert('onStart')
        internalAlert(event)
      },
    },
  )
}

const progressVisit = () => {
  router.on('progress', (event) => {
    internalAlert('Inertia.on(progress)')
    internalAlert(event)
  })

  document.addEventListener('inertia:progress', (event) => {
    internalAlert('addEventListener(inertia:progress)')
    internalAlert(event)
  })

  router.post(page.url, payloadWithFile, {
    onProgress: (event) => {
      internalAlert('onProgress')
      internalAlert(event)
    },
  })
}

const progressNoFilesVisit = () => {
  router.on('progress', (event) => {
    internalAlert('Inertia.on(progress)')
    internalAlert(event)
  })

  document.addEventListener('inertia:progress', (event) => {
    internalAlert('addEventListener(inertia:progress)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('progressNoFilesOnBefore'),
      onProgress: (event) => {
        internalAlert('onProgress')
        internalAlert(event)
      },
    },
  )
}

const cancelVisit = () => {
  router.on('cancel', (event) => {
    internalAlert('Inertia.on(cancel)')
    internalAlert(event)
  })

  document.addEventListener('inertia:cancel', (event) => {
    internalAlert('addEventListener(inertia:cancel)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onCancelToken: (token) => token.cancel(),
      onCancel: (event) => {
        internalAlert('onCancel')
        internalAlert(event)
      },
    },
  )
}

const errorVisit = () => {
  router.on('error', (event) => {
    internalAlert('Inertia.on(error)')
    internalAlert(event)
  })

  document.addEventListener('inertia:error', (event) => {
    internalAlert('addEventListener(inertia:error)')
    internalAlert(event)
  })

  router.post(
    '/events/errors',
    {},
    {
      onError: (errors) => {
        internalAlert('onError')
        internalAlert(errors)
      },
    },
  )
}

const errorPromiseVisit = () => {
  router.post(
    '/events/errors',
    {},
    {
      onError: () => callbackSuccessErrorPromise('onError'),
      onSuccess: () => internalAlert('This listener should not have been called'),
      onFinish: () => internalAlert('onFinish'),
    },
  )
}

const successVisit = () => {
  router.on('success', (event) => {
    internalAlert('Inertia.on(success)')
    internalAlert(event)
  })

  document.addEventListener('inertia:success', (event) => {
    internalAlert('addEventListener(inertia:success)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onError: () => internalAlert('This listener should not have been called'),
      onSuccess: (page) => {
        internalAlert('onSuccess')
        internalAlert(page)
      },
    },
  )
}

const successPromiseVisit = () => {
  router.post(
    page.url,
    {},
    {
      onSuccess: () => callbackSuccessErrorPromise('onSuccess'),
      onError: () => internalAlert('This listener should not have been called'),
      onFinish: () => internalAlert('onFinish'),
    },
  )
}

const finishVisit = () => {
  router.on('finish', (event) => {
    internalAlert('Inertia.on(finish)')
    internalAlert(event)
  })

  document.addEventListener('inertia:finish', (event) => {
    internalAlert('addEventListener(inertia:finish)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onFinish: (event) => {
        internalAlert('onFinish')
        internalAlert(event)
      },
    },
  )
}

const invalidVisit = () => {
  router.on('invalid', (event) => {
    internalAlert('Inertia.on(invalid)')
    internalAlert(event)
  })

  document.addEventListener('inertia:invalid', (event) => {
    internalAlert('addEventListener(inertia:invalid)')
    internalAlert(event)
  })

  router.post(
    '/non-inertia',
    {},
    {
      onInvalid: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const exceptionVisit = () => {
  router.on('exception', (event) => {
    internalAlert('Inertia.on(exception)')
    internalAlert(event)
  })

  document.addEventListener('inertia:exception', (event) => {
    internalAlert('addEventListener(inertia:exception)')
    internalAlert(event)
  })

  router.post(
    '/disconnect',
    {},
    {
      onException: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const navigateVisit = () => {
  router.on('navigate', (event) => {
    internalAlert('Inertia.on(navigate)')
    internalAlert(event)
  })

  document.addEventListener('inertia:navigate', (event) => {
    internalAlert('addEventListener(inertia:navigate)')
    internalAlert(event)
  })

  router.get(
    '/',
    {},
    {
      onNavigate: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const registerAllListeners = () => {
  router.on('before', () => internalAlert('Inertia.on(before)'))
  router.on('cancelToken', () => internalAlert('Inertia.on(cancelToken)'))
  router.on('cancel', () => internalAlert('Inertia.on(cancel)'))
  router.on('start', () => internalAlert('Inertia.on(start)'))
  router.on('progress', () => internalAlert('Inertia.on(progress)'))
  router.on('error', () => internalAlert('Inertia.on(error)'))
  router.on('success', () => internalAlert('Inertia.on(success)'))
  router.on('invalid', () => internalAlert('Inertia.on(invalid)'))
  router.on('exception', () => internalAlert('Inertia.on(exception)'))
  router.on('finish', () => internalAlert('Inertia.on(finish)'))
  router.on('navigate', () => internalAlert('Inertia.on(navigate)'))
  document.addEventListener('inertia:before', () => internalAlert('addEventListener(inertia:before)'))
  document.addEventListener('inertia:cancelToken', () => internalAlert('addEventListener(inertia:cancelToken)'))
  document.addEventListener('inertia:cancel', () => internalAlert('addEventListener(inertia:cancel)'))
  document.addEventListener('inertia:start', () => internalAlert('addEventListener(inertia:start)'))
  document.addEventListener('inertia:progress', () => internalAlert('addEventListener(inertia:progress)'))
  document.addEventListener('inertia:error', () => internalAlert('addEventListener(inertia:error)'))
  document.addEventListener('inertia:success', () => internalAlert('addEventListener(inertia:success)'))
  document.addEventListener('inertia:invalid', () => internalAlert('addEventListener(inertia:invalid)'))
  document.addEventListener('inertia:exception', () => internalAlert('addEventListener(inertia:exception)'))
  document.addEventListener('inertia:finish', () => internalAlert('addEventListener(inertia:finish)'))
  document.addEventListener('inertia:navigate', () => internalAlert('addEventListener(inertia:navigate)'))

  return {
    onBefore: () => internalAlert('onBefore'),
    onCancelToken: () => internalAlert('onCancelToken'),
    onCancel: () => internalAlert('onCancel'),
    onStart: () => internalAlert('onStart'),
    onProgress: () => internalAlert('onProgress'),
    onError: () => internalAlert('onError'),
    onSuccess: () => internalAlert('onSuccess'),
    onInvalid: () => internalAlert('onInvalid'), // Does not exist.
    onException: () => internalAlert('onException'), // Does not exist.
    onFinish: () => internalAlert('onFinish'),
    onNavigate: () => internalAlert('onNavigate'), // Does not exist.
  }
}

const lifecycleSuccess = () => {
  router.post(page.url, payloadWithFile, registerAllListeners())
}

const lifecycleError = () => {
  router.post('/events/errors', payloadWithFile, registerAllListeners())
}

const lifecycleCancel = () => {
  router.post('/sleep', payloadWithFile, {
    ...registerAllListeners(),
    onCancelToken: (token) => {
      internalAlert('onCancelToken')

      setTimeout(() => {
        internalAlert('CANCELLING!')
        token.cancel()
      }, 10)
    },
  })
}

const lifecycleCancelAfterFinish = () => {
  let cancelToken = null

  router.post(page.url, payloadWithFile, {
    ...registerAllListeners(),
    onCancelToken: (token) => {
      internalAlert('onCancelToken')
      cancelToken = token
    },
    onFinish: () => {
      internalAlert('onFinish')
      internalAlert('CANCELLING!')
      cancelToken.cancel()
    },
  })
}

const callbackSuccessErrorPromise = (eventName) => {
  internalAlert(eventName)
  setTimeout(() => internalAlert('onFinish should have been fired by now if Promise functionality did not work'), 5)
  return new Promise((resolve) => setTimeout(resolve, 20))
}
</script>

<template>
  <div>
    <!-- Listeners -->
    <a href="#" @click.prevent="withoutEventListeners" class="without-listeners">Basic Visit</a>
    <a href="#" @click.prevent="removeInertiaListener" class="remove-inertia-listener">Remove Inertia Listener</a>

    <!-- Events: Before -->
    <a href="#" @click.prevent="beforeVisit" class="before">Before Event</a>
    <a href="#" @click.prevent="beforeVisitPreventLocal" class="before-prevent-local">Before Event (Prevent)</a>
    <Link
      :href="$page.url"
      method="post"
      @before="(visit) => internalAlert('linkOnBefore', visit)"
      @start="() => internalAlert('linkOnStart')"
      class="link-before"
      >Before Event Link</Link
    >
    <Link
      :href="$page.url"
      method="post"
      @before="
        (visit) => {
          internalAlert('linkOnBefore')
          return false
        }
      "
      @start="() => internalAlert('This listener should not have been called.')"
      class="link-before-prevent-local"
      >Before Event Link (Prevent)</Link
    >
    <a href="#" @click.prevent="beforeVisitPreventGlobalInertia" class="before-prevent-global-inertia"
      >Before Event - Prevent globally using Inertia Event Listener</a
    >
    <a href="#" @click.prevent="beforeVisitPreventGlobalNative" class="before-prevent-global-native"
      >Before Event - Prevent globally using Native Event Listeners</a
    >

    <!-- Events: CancelToken -->
    <a href="#" @click.prevent="cancelTokenVisit" class="canceltoken">Cancel Token Event</a>
    <Link
      :href="$page.url"
      method="post"
      @cancelToken="(event) => internalAlert('linkOnCancelToken', event)"
      class="link-canceltoken"
      >Cancel Token Event Link</Link
    >

    <!-- Events: Cancel -->
    <a href="#" @click.prevent="cancelVisit" class="cancel">Cancel Event</a>
    <Link
      :href="$page.url"
      method="post"
      @cancelToken="(token) => token.cancel()"
      @cancel="(event) => internalAlert('linkOnCancel', event)"
      class="link-cancel"
      >Cancel Event Link</Link
    >

    <!-- Events: Start -->
    <a href="#" @click.prevent="startVisit" class="start">Start Event</a>
    <Link :href="$page.url" method="post" @start="(event) => internalAlert('linkOnStart', event)" class="link-start"
      >Start Event Link</Link
    >

    <!-- Events: Progress -->
    <a href="#" @click.prevent="progressVisit" class="progress">Progress Event</a>
    <a href="#" @click.prevent="progressNoFilesVisit" class="progress-no-files">Missing Progress Event (no files)</a>
    <Link
      :href="$page.url"
      method="post"
      :data="payloadWithFile"
      @progress="(event) => internalAlert('linkOnProgress', event)"
      class="link-progress"
      >Progress Event Link</Link
    >
    <Link
      :href="$page.url"
      method="post"
      @before="() => internalAlert('linkProgressNoFilesOnBefore')"
      @progress="(event) => internalAlert('linkOnProgress', event)"
      class="link-progress-no-files"
      >Progress Event Link (no files)</Link
    >

    <!-- Events: Error -->
    <a href="#" @click.prevent="errorVisit" class="error">Error Event</a>
    <a href="#" @click.prevent="errorPromiseVisit" class="error-promise">Error Event (delaying onFinish w/ Promise)</a>
    <Link
      href="/events/errors"
      method="post"
      @error="(errors) => internalAlert('linkOnError', errors)"
      @success="() => internalAlert('This listener should not have been called')"
      class="link-error"
      >Error Event Link</Link
    >
    <Link
      href="/events/errors"
      method="post"
      @error="() => callbackSuccessErrorPromise('linkOnError')"
      @success="() => internalAlert('This listener should not have been called')"
      @finish="() => internalAlert('linkOnFinish')"
      class="link-error-promise"
      >Error Event Link (delaying onFinish w/ Promise)</Link
    >

    <!-- Events: Success -->
    <a href="#" @click.prevent="successVisit" class="success">Success Event</a>
    <a href="#" @click.prevent="successPromiseVisit" class="success-promise"
      >Success Event (delaying onFinish w/ Promise)</a
    >
    <Link
      :href="$page.url"
      method="post"
      @error="() => internalAlert('This listener should not have been called')"
      @success="(event) => internalAlert('linkOnSuccess', event)"
      class="link-success"
      >Success Event Link</Link
    >
    <Link
      :href="$page.url"
      method="post"
      @error="() => internalAlert('This listener should not have been called')"
      @success="() => callbackSuccessErrorPromise('linkOnSuccess')"
      @finish="() => internalAlert('linkOnFinish')"
      class="link-success-promise"
      >Success Event Link (delaying onFinish w/ Promise)</Link
    >

    <!-- Events: Invalid -->
    <a href="#" @click.prevent="invalidVisit" class="invalid">Invalid Event</a>

    <!-- Events: Exception -->
    <a href="#" @click.prevent="exceptionVisit" class="exception">Exception Event</a>

    <!-- Events: Finish -->
    <a href="#" @click.prevent="finishVisit" class="finish">Finish Event</a>
    <Link :href="$page.url" method="post" @finish="(event) => internalAlert('linkOnFinish', event)" class="link-finish"
      >Finish Event Link</Link
    >

    <!-- Events: Navigate -->
    <a href="#" @click.prevent="navigateVisit" class="navigate">Navigate Event</a>

    <!-- Lifecycles -->
    <a href="#" @click.prevent="lifecycleSuccess" class="lifecycle-success">Lifecycle Success</a>
    <a href="#" @click.prevent="lifecycleError" class="lifecycle-error">Lifecycle Error</a>
    <a href="#" @click.prevent="lifecycleCancel" class="lifecycle-cancel">Lifecycle Cancel</a>
    <a href="#" @click.prevent="lifecycleCancelAfterFinish" class="lifecycle-cancel-after-finish"
      >Lifecycle Cancel - After Finish</a
    >
  </div>
</template>
