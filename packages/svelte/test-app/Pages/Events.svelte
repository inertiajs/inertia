<script context="module" lang="ts">
  declare global {
    interface Window {
      messages: unknown[]
    }
  }
</script>

<script lang="ts">
  import { inertia, page, router } from '@inertiajs/svelte'

  const payloadWithFile = {
    file: new File(['foobar'], 'example.bin'),
  }

  window.messages = []

  const internalAlert = (...args: unknown[]) => {
    window.messages.push(...args)
  }

  const withoutEventListeners = () => {
    router.post($page.url, {})
  }

  const removeInertiaListener = () => {
    const removeEventListener = router.on('before', () => internalAlert('Inertia.on(before)'))

    internalAlert('Removing Inertia.on Listener')
    removeEventListener()

    router.post(
      $page.url,
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
      $page.url,
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
      $page.url,
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
    router.on('before', () => {
      internalAlert('Inertia.on(before)')
      return false
    })

    router.post(
      $page.url,
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
      $page.url,
      {},
      {
        onBefore: () => internalAlert('onBefore'),
        onStart: () => internalAlert('This listener should not have been called.'),
      },
    )
  }

  const cancelTokenVisit = () => {
    // @ts-expect-error - We're testing that the router doesn't have an onCancelToken listener
    router.on('cancelToken', () => internalAlert('This listener should not have been called.'))
    document.addEventListener('inertia:cancelToken', () => internalAlert('This listener should not have been called.'))

    router.post(
      $page.url,
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
      $page.url,
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

    router.post($page.url, payloadWithFile, {
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
      $page.url,
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
      $page.url,
      {},
      {
        onCancelToken: (token) => {
          token.cancel()
        },
        // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
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
      $page.url,
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
      $page.url,
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
      $page.url,
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
        // @ts-expect-error - We're testing that the VisitCallbacks interface does not have an onInvalid method
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
        // @ts-expect-error - We're testing that the VisitCallbacks interface does not have an onException method
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
        // @ts-expect-error - We're testing that the VisitCallbacks interface does not have an onNavigate method
        onNavigate: () => internalAlert('This listener should not have been called.'),
      },
    )
  }

  const registerAllListeners = () => {
    router.on('before', () => internalAlert('Inertia.on(before)'))
    // @ts-expect-error - We're testing that the router doesn't have an onCancelToken listener
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
    router.post($page.url, payloadWithFile, registerAllListeners())
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
        }, 250)
      },
    })
  }

  const lifecycleCancelAfterFinish = () => {
    let cancelToken: { cancel: () => void } | null = null

    router.post($page.url, payloadWithFile, {
      ...registerAllListeners(),
      onCancelToken: (token) => {
        internalAlert('onCancelToken')
        cancelToken = token
      },
      onFinish: () => {
        internalAlert('onFinish')
        internalAlert('CANCELLING!')
        cancelToken?.cancel()
      },
    })
  }

  const callbackSuccessErrorPromise = (eventName: string) => {
    internalAlert(eventName)
    setTimeout(() => internalAlert('onFinish should have been fired by now if Promise functionality did not work'), 5)
    return new Promise((resolve) => setTimeout(resolve, 20))
  }

  const handleCancelToken = (event: CustomEvent) => {
    ;(event.detail as { token: { cancel: () => void } }).token.cancel()
  }

  const handleCancel = (event: Event | CustomEvent) => {
    const customEvent = event as CustomEvent
    internalAlert('linkOnCancel', customEvent.detail || undefined)
  }

  const handleProgress = (event: Event | CustomEvent<{ progress: unknown }>) => {
    const customEvent = event as CustomEvent<{ progress: unknown }>
    internalAlert('linkOnProgress', customEvent.detail.progress)
  }

  const handleError = (event: Event | CustomEvent<{ errors: unknown }>) => {
    const customEvent = event as CustomEvent<{ errors: unknown }>
    internalAlert('linkOnError', customEvent.detail.errors)
  }
</script>

<div>
  <!-- Listeners -->
  <a href={'#'} on:click|preventDefault={withoutEventListeners} class="without-listeners">Basic Visit</a>
  <a href={'#'} on:click|preventDefault={removeInertiaListener} class="remove-inertia-listener"
    >Remove Inertia Listener</a
  >

  <!-- Events: Before -->
  <a href={'#'} on:click|preventDefault={beforeVisit} class="before">Before Event</a>
  <a href={'#'} on:click|preventDefault={beforeVisitPreventLocal} class="before-prevent-local">Before Event (Prevent)</a
  >
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:before={(event) => internalAlert('linkOnBefore', event.detail.visit)}
    on:start={() => internalAlert('linkOnStart')}
    class="link-before">Before Event Link</button
  >
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:before={(event) => {
      event.preventDefault()
      internalAlert('linkOnBefore')
    }}
    on:start={() => {
      internalAlert('This listener should not have been called.')
    }}
    class="link-before-prevent-local">Before Event Link (Prevent)</button
  >
  <a href={'#'} on:click|preventDefault={beforeVisitPreventGlobalInertia} class="before-prevent-global-inertia"
    >Before Event - Prevent globally using Inertia Event Listener</a
  >
  <a href={'#'} on:click|preventDefault={beforeVisitPreventGlobalNative} class="before-prevent-global-native"
    >Before Event - Prevent globally using Native Event Listeners</a
  >

  <!-- Events: CancelToken -->
  <a href={'#'} on:click|preventDefault={cancelTokenVisit} class="canceltoken">Cancel Token Event</a>
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:cancel-token={(event) => internalAlert('linkOnCancelToken', event.detail)}
    class="link-canceltoken">Cancel Token Event Link</button
  >

  <!-- Events: Cancel -->
  <a href={'#'} on:click|preventDefault={cancelVisit} class="cancel">Cancel Event</a>
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:cancel-token={handleCancelToken}
    on:cancel={handleCancel}
    class="link-cancel">Cancel Event Link</button
  >

  <!-- Events: Start -->
  <a href={'#'} on:click|preventDefault={startVisit} class="start">Start Event</a>
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:start={(event) => internalAlert('linkOnStart', event.detail.visit)}
    class="link-start">Start Event Link</button
  >

  <!-- Events: Progress -->
  <a href={'#'} on:click|preventDefault={progressVisit} class="progress">Progress Event</a>
  <a href={'#'} on:click|preventDefault={progressNoFilesVisit} class="progress-no-files"
    >Missing Progress Event (no files)</a
  >
  <button
    use:inertia={{ href: $page.url, method: 'post', data: payloadWithFile }}
    on:progress={handleProgress}
    class="link-progress">Progress Event Link</button
  >
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:before={() => internalAlert('linkProgressNoFilesOnBefore')}
    on:progress={handleProgress}
    class="link-progress-no-files">Progress Event Link (no files)</button
  >

  <!-- Events: Error -->
  <a href={'#'} on:click|preventDefault={errorVisit} class="error">Error Event</a>
  <a href={'#'} on:click|preventDefault={errorPromiseVisit} class="error-promise"
    >Error Event (delaying onFinish w/ Promise)</a
  >
  <button
    use:inertia={{ href: '/events/errors', method: 'post' }}
    on:error={handleError}
    on:success={() => internalAlert('This listener should not have been called')}
    class="link-error">Error Event Link</button
  >
  <button
    use:inertia={{ href: '/events/errors', method: 'post' }}
    on:error={() => callbackSuccessErrorPromise('linkOnError')}
    on:success={() => internalAlert('This listener should not have been called')}
    on:finish={() => internalAlert('linkOnFinish')}
    class="link-error-promise">Error Event Link (delaying onFinish w/ Promise)</button
  >

  <!-- Events: Success -->
  <a href={'#'} on:click|preventDefault={successVisit} class="success">Success Event</a>
  <a href={'#'} on:click|preventDefault={successPromiseVisit} class="success-promise"
    >Success Event (delaying onFinish w/ Promise)</a
  >
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:error={() => internalAlert('This listener should not have been called')}
    on:success={(event) => internalAlert('linkOnSuccess', event.detail.page)}
    class="link-success">Success Event Link</button
  >
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:error={() => internalAlert('This listener should not have been called')}
    on:success={() => callbackSuccessErrorPromise('linkOnSuccess')}
    on:finish={() => internalAlert('linkOnFinish')}
    class="link-success-promise">Success Event Link (delaying onFinish w/ Promise)</button
  >

  <!-- Events: Invalid -->
  <a href={'#'} on:click|preventDefault={invalidVisit} class="invalid">Invalid Event</a>

  <!-- Events: Exception -->
  <a href={'#'} on:click|preventDefault={exceptionVisit} class="exception">Exception Event</a>

  <!-- Events: Finish -->
  <a href={'#'} on:click|preventDefault={finishVisit} class="finish">Finish Event</a>
  <button
    use:inertia={{ href: $page.url, method: 'post' }}
    on:finish={(event) => internalAlert('linkOnFinish', event.detail.visit)}
    class="link-finish">Finish Event Link</button
  >

  <!-- Events: Navigate -->
  <a href={'#'} on:click|preventDefault={navigateVisit} class="navigate">Navigate Event</a>

  <!-- Events: Prefetch -->
  <button
    use:inertia={{ href: '/prefetch/2', prefetch: 'hover' }}
    on:prefetching={(event) => internalAlert('linkOnPrefetching', event.detail.visit)}
    on:prefetched={(event) => internalAlert('linkOnPrefetched', event.detail.response, event.detail.visit)}
    class="link-prefetch-hover"
  >
    Prefetch Event Link (Hover)
  </button>

  <!-- Lifecycles -->
  <a href={'#'} on:click|preventDefault={lifecycleSuccess} class="lifecycle-success">Lifecycle Success</a>
  <a href={'#'} on:click|preventDefault={lifecycleError} class="lifecycle-error">Lifecycle Error</a>
  <a href={'#'} on:click|preventDefault={lifecycleCancel} class="lifecycle-cancel">Lifecycle Cancel</a>
  <a href={'#'} on:click|preventDefault={lifecycleCancelAfterFinish} class="lifecycle-cancel-after-finish"
    >Lifecycle Cancel - After Finish</a
  >
</div>
