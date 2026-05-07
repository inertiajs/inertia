<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let status = $state('idle')
  let cancelFired = $state(false)
  let timeoutFired = $state(false)

  const visit = (timeout: number | string = 300) => {
    status = 'pending'
    cancelFired = false
    timeoutFired = false
    router.visit('/visit/timeout/slow?delay=2000', {
      timeout,
      onTimeout: () => {
        timeoutFired = true
        status = 'timed-out'
      },
      onCancel: () => {
        cancelFired = true
      },
      onSuccess: () => {
        status = 'success'
      },
    })
  }
</script>

<button id="visit" onclick={() => visit(1500)}>Visit</button>
<button id="visit-string" onclick={() => visit('300ms')}>Visit (string)</button>
<span id="status">{status}</span>
<span id="cancel-fired">{cancelFired ? 'yes' : 'no'}</span>
<span id="timeout-fired">{timeoutFired ? 'yes' : 'no'}</span>
