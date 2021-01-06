<template>
  <div>
    <span class="text">This is the page that demonstrates visit cancellation using manual visits</span>
    <span @click="cancelledVisit" class="cancel">Cancellable Visit</span>
  </div>
</template>
<script>
export default {
  methods: {
    cancelledVisit() {
      this.$inertia.post('/sleep', {}, {
        onCancelToken: token => {
          alert('onCancelToken')

          token.cancel()
        },
        onCancel: () => alert('onCancel'),
        onFinish: () => alert('onFinish')
      })
    },
  }
}
</script>
