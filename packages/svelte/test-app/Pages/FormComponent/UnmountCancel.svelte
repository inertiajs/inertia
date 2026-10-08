<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let { cancelOnUnmount }: { cancelOnUnmount: boolean } = $props()

  let events: string[] = $state([])
  let showModal = $state(true)
  let closeOnSuccess = $state(false)

  function log(eventName: string) {
    events = [...events, eventName]
  }

  function onBefore() {
    log('onBefore')
  }

  function onStart() {
    log('onStart')
  }

  function onFinish() {
    log('onFinish')
  }

  function onCancel() {
    log('onCancel')
  }

  async function onSuccess() {
    log('onSuccess')

    if (closeOnSuccess) {
      showModal = false

      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  function onCancelToken() {
    log('onCancelToken')
  }
</script>

<div>
  <h1>Form Unmount Cancel</h1>

  <div>
    Events: <span id="events">{events.join(',')}</span>
  </div>

  {#if showModal}
    <Form
      action={`/form-component/unmount-cancel/${cancelOnUnmount ? 'yes' : 'no'}`}
      method="post"
      {cancelOnUnmount}
      {onBefore}
      {onStart}
      {onFinish}
      {onCancel}
      {onSuccess}
      {onCancelToken}
    >
      <input type="text" name="name" value="John" />

      <button type="submit">Submit</button>
    </Form>
  {/if}

  <button type="button" onclick={() => (showModal = false)}>Close Modal</button>
  <button type="button" onclick={() => (closeOnSuccess = true)}>Close On Success</button>
</div>
