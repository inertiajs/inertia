<template>
  <div>
    <!-- Listeners -->
    <span @click="withoutEventListeners" class="without-listeners">Basic Visit</span>
    <span @click="removeInertiaListener" class="remove-inertia-listener">Remove Inertia Listener</span>

    <!-- Events: Before -->
    <span @click="beforeVisit" class="before">Before Event</span>
    <span @click="beforeVisitPreventLocal" class="before-prevent-local">Before Event</span>
    <span @click="beforeVisitPreventGlobalInertia" class="before-prevent-global-inertia">Before Event - Prevent globally using Inertia Event Listener</span>
    <span @click="beforeVisitPreventGlobalNative" class="before-prevent-global-native">Before Event - Prevent globally using Native Event Listeners</span>

    <!-- Events: CancelToken -->
    <span @click="cancelTokenVisit" class="canceltoken">Cancel Token Event</span>

    <!-- Events: Cancel -->
    <span @click="cancelVisit" class="cancel">Cancel Event</span>

    <!-- Events: Start -->
    <span @click="startVisit" class="start">Start Event</span>

    <!-- Events: Progress -->
    <span @click="progressVisit" class="progress">Progress Event</span>
    <span @click="progressNoFilesVisit" class="progress-no-files">Missing Progress Event (no files)</span>

    <!-- Events: Error -->
    <span @click="errorVisit" class="error">Error Event</span>
    <span @click="errorPromiseVisit" class="error-promise">Error Event (delaying onFinish w/ Promise)</span>

    <!-- Events: Success -->
    <span @click="successVisit" class="success">Success Event</span>
    <span @click="successPromiseVisit" class="success-promise">Success Event (delaying onFinish w/ Promise)</span>

    <!-- Events: Invalid -->
    <span @click="invalidVisit" class="invalid">Finish Event</span>

    <!-- Events: Exception -->
    <span @click="exceptionVisit" class="exception">Exception Event</span>

    <!-- Events: Finish -->
    <span @click="finishVisit" class="finish">Finish Event</span>

    <!-- Events: Navigate -->
    <span @click="navigateVisit" class="navigate">Navigate Event</span>
  </div>
</template>
<script>
import { Inertia } from '@inertiajs/inertia'

export default {
  methods: {
    withoutEventListeners() {
      this.$inertia.post(this.$page.url, {})
    },
    removeInertiaListener() {
      const removeEventListener = Inertia.on('before', () => alert('Inertia.on(before)'))

      alert('Removing Inertia.on Listener')
      removeEventListener();

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => alert('onBefore'),
        onStart: () => alert('onStart')
      })
    },
    beforeVisit() {
      Inertia.on('before', event => {
        alert('Inertia.on(before)')
        alert(event)
      })

      document.addEventListener('inertia:before', event => {
        alert('addEventListener(inertia:before)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onBefore: event => {
          alert('onBefore')
          alert(event)
        },
        onStart: () => alert('onStart')
      })
    },
    beforeVisitPreventLocal() {
      document.addEventListener('inertia:before', () => alert('addEventListener(inertia:before)'))
      Inertia.on('before', () => alert('Inertia.on(before)'))

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => {
          alert('onBefore')
          return false
        },
        onStart: () => alert('This listener should not have been called.')
      })
    },
    beforeVisitPreventGlobalInertia() {
      document.addEventListener('inertia:before', () => alert('addEventListener(inertia:before)'))
      Inertia.on('before', visit => {
        alert('Inertia.on(before)')
        return false
      })

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => alert('onBefore'),
        onStart: () => alert('This listener should not have been called.')
      })
    },
    beforeVisitPreventGlobalNative() {
      Inertia.on('before', () => alert('Inertia.on(before)'))
      document.addEventListener('inertia:before', event => {
        alert('addEventListener(inertia:before)')
        event.preventDefault()
      })

      this.$inertia.post(this.$page.url, {}, {
        onBefore: () => alert('onBefore'),
        onStart: () => alert('This listener should not have been called.')
      })
    },
    cancelTokenVisit() {
      Inertia.on('cancelToken', () => alert('This listener should not have been called.'))
      document.addEventListener('inertia:cancelToken', () => alert('This listener should not have been called.'))

      this.$inertia.post(this.$page.url, {}, {
        onCancelToken: event => {
          alert('onCancelToken')
          alert(event)
        },
      })
    },
    startVisit() {
      Inertia.on('start', event => {
        alert('Inertia.on(start)')
        alert(event)
      })

      document.addEventListener('inertia:start', event => {
        alert('addEventListener(inertia:start)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onStart: event => {
          alert('onStart')
          alert(event)
        },
      })
    },
    progressVisit() {
      Inertia.on('progress', event => {
        alert('Inertia.on(progress)')
        alert(event)
      })

      document.addEventListener('inertia:progress', event => {
        alert('addEventListener(inertia:progress)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {
        file: new File(['foobar'], 'example.bin')
      }, {
        onProgress: event => {
          alert('onProgress')
          alert(event)
        },
      })
    },
    progressNoFilesVisit() {
      Inertia.on('progress', event => {
        alert('Inertia.on(progress)')
        alert(event)
      })

      document.addEventListener('inertia:progress', event => {
        alert('addEventListener(inertia:progress)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onProgress: event => {
          alert('onProgress')
          alert(event)
        }
      })
    },
    cancelVisit() {
      Inertia.on('cancel', event => {
        alert('Inertia.on(cancel)')
        alert(event)
      })

      document.addEventListener('inertia:cancel', event => {
        alert('addEventListener(inertia:cancel)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onCancelToken: token => token.cancel(),
        onCancel: event => {
          alert('onCancel')
          alert(event)
        }
      })
    },
    errorVisit() {
      Inertia.on('error', event => {
        alert('Inertia.on(error)')
        alert(event)
      })

      document.addEventListener('inertia:error', event => {
        alert('addEventListener(inertia:error)')
        alert(event)
      })

      this.$inertia.post('/events/errors', {}, {
        onError: errors => {
          alert('onError')
          alert(errors)
        }
      })
    },
    errorPromiseVisit() {
      this.$inertia.post('/events/errors', {}, {
        onError: () => {
          alert('onError');
          setTimeout(() => alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise(resolve => setTimeout(resolve, 20))
        },
        onSuccess: () => alert('This listener should not have been called'),
        onFinish: () => alert('onFinish')
      })
    },
    successVisit() {
      Inertia.on('success', event => {
        alert('Inertia.on(success)')
        alert(event)
      })

      document.addEventListener('inertia:success', event => {
        alert('addEventListener(inertia:success)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onError: () => alert('This listener should not have been called'),
        onSuccess: page => {
          alert('onSuccess')
          alert(page)
        }
      })
    },
    successPromiseVisit() {
      this.$inertia.post(this.$page.url, {}, {
        onSuccess: () => {
          alert('onSuccess');
          setTimeout(() => alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise(resolve => setTimeout(resolve, 20))
        },
        onError: () => alert('This listener should not have been called'),
        onFinish: () => alert('onFinish')
      })
    },
    finishVisit() {
      Inertia.on('finish', event => {
        alert('Inertia.on(finish)')
        alert(event)
      })

      document.addEventListener('inertia:finish', event => {
        alert('addEventListener(inertia:finish)')
        alert(event)
      })

      this.$inertia.post(this.$page.url, {}, {
        onFinish: event => {
          alert('onFinish')
          alert(event)
        }
      })
    },
    invalidVisit() {
      Inertia.on('invalid', event => {
        alert('Inertia.on(invalid)')
        alert(event)
      })

      document.addEventListener('inertia:invalid', event => {
        alert('addEventListener(inertia:invalid)')
        alert(event)
      })

      this.$inertia.post('/non-inertia', {}, {
        onInvalid: () => alert('This listener should not have been called.')
      })
    },
    exceptionVisit() {
      Inertia.on('exception', event => {
        alert('Inertia.on(exception)')
        alert(event)
      })

      document.addEventListener('inertia:exception', event => {
        alert('addEventListener(inertia:exception)')
        alert(event)
      })

      this.$inertia.post('/disconnect', {}, {
        onException: () => alert('This listener should not have been called.')
      })
    },
    navigateVisit() {
      Inertia.on('navigate', event => {
        alert('Inertia.on(navigate)')
        alert(event)
      })

      document.addEventListener('inertia:navigate', event => {
        alert('addEventListener(inertia:navigate)')
        alert(event)
      })

      this.$inertia.get('/', {}, {
        onNavigate: () => alert('This listener should not have been called.')
      })
    },
  }
}
</script>
