<template>
  <div>
    <span class="text">This is the page that demonstrates visit events using manual visits</span>
    <span @click="successfulRequest" class="successful-request">Successful request</span>
    <span @click="errorRequest" class="error-request">Error request</span>
    <span @click="cancelledVisit" class="cancel">Cancellable Visit</span>
    <span @click="cancelledAfterResponse" class="cancel-after-response">Cancelled After Receiving a Response</span>
    <span @click="cancelledAfterFinish" class="cancel-after-finish">Cancelled After Finish</span>

    <span @click="onBeforeVisit" class="before">onBefore</span>
    <span @click="onBeforeVisitCancelled" class="before-cancel">onBefore cancellation</span>
    <span @click="onStartVisit" class="start">onStart</span>
    <span @click="onProgressVisit" class="progress">onProgress</span>
    <span @click="onSuccessVisit" class="success">onSuccess</span>
    <span @click="onSuccessPromiseVisit" class="success-promise">onSuccess promise</span>
    <span @click="onErrorVisit" class="error">onError</span>
    <span @click="onErrorPromiseVisit" class="error-promise">onError promise</span>
    <span @click="onFinishVisit" class="finish">finish</span>
  </div>
</template>
<script>
export default {
  methods: {
    callbacks(overrides = {}) {
      const defaults = {
        onCancelToken: () => alert('onCancelToken'),
        onBefore: () => alert('onBefore'),
        onStart: () => alert('onStart'),
        onProgress: () => alert('onProgress'),
        onFinish: () => alert('onFinish'),
        onCancel: () => alert('onCancel'),
        onSuccess: () => alert('onSuccess'),
        onError: () => alert('onError'),
      }

      return {
        ... defaults,
        ... overrides
      }
    },
    successfulRequest() {
      this.$inertia.post('/dump/post', {}, {
        ... this.callbacks()
      })
    },
    errorRequest() {
      this.$inertia.post('/visits/events-errors', {}, {
        ... this.callbacks()
      })
    },
    cancelledVisit() {
      this.$inertia.post('/sleep', {}, {
        ... this.callbacks({
          onCancelToken: token => {
            alert('onCancelToken');

            setTimeout(() => {
              alert('CANCELLING!')
              token.cancel()
            }, 10);
          },
        })
      })
    },
    cancelledAfterResponse() {
      let cancelToken = null;

      this.$inertia.get('/visits/events', {}, {
        ... this.callbacks({
          onCancelToken: token => {
            alert('onCancelToken');
            cancelToken = token
          },
          onSuccess: () => {
            alert('onSuccess')
            alert('CANCELLING!')
            cancelToken.cancel();
          }
        })
      })
    },
    cancelledAfterFinish() {
      let cancelToken = null;

      this.$inertia.get('/visits/events', {}, {
        ... this.callbacks({
          onCancelToken: token => {
            alert('onCancelToken');
            cancelToken = token
          },
          onFinish: () => {
            alert('onFinish')

            setTimeout(() => {
              alert('CANCELLING!')
              cancelToken.cancel()
            }, 10);
          }
        })
      })
    },
    onBeforeVisit() {
      this.$inertia.post('/sleep', {}, {
        ... this.callbacks({
          onBefore: visit => {
            alert("onBefore")
            alert(visit);
          }
        })
      })
    },
    onBeforeVisitCancelled() {
      this.$inertia.post('/sleep', {}, {
        ... this.callbacks({
          onBefore: visit => {
            alert("onBefore")
            return false
          }
        })
      })
    },
    onStartVisit() {
      this.$inertia.post('/visits/events', {}, {
        ... this.callbacks({
          onStart: visit => {
            alert('onStart');
            alert(visit)
          }
        })
      })
    },
    onProgressVisit() {
      this.$inertia.post('/visits/events', {
        file: new File(['foobar'], 'example.bin')
      }, {
        ... this.callbacks({
          onProgress: event => {
            alert('onProgress');
            alert(event)
          }
        })
      })
    },
    onSuccessVisit() {
      this.$inertia.post('/dump/post', {}, {
        ... this.callbacks({
          onSuccess: page => {
            alert('onSuccess');
            alert(page)
          }
        })
      })
    },
    onSuccessPromiseVisit() {
      this.$inertia.post('/dump/post', {}, {
        ... this.callbacks({
          onSuccess: page => {
            alert('onSuccess');

            setTimeout(() => alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
            return new Promise(resolve => setTimeout(resolve, 20))
          }
        })
      })
    },
    onErrorVisit() {
      this.$inertia.post('/visits/events-errors', {}, {
        ... this.callbacks({
          onError: errors => {
            alert('onError');
            alert(errors)
          }
        })
      })
    },
    onErrorPromiseVisit() {
      this.$inertia.post('/visits/events-errors', {}, {
        ... this.callbacks({
          onError: errors => {
            alert('onError');

            setTimeout(() => alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
            return new Promise(resolve => setTimeout(resolve, 20))
          }
        })
      })
    }
  }
}
</script>
