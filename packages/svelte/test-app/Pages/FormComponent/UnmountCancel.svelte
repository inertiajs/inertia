<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let { cancelOnUnmount }: { cancelOnUnmount: boolean } = $props()

  let events: string[] = $state([])
  let showModal = $state(true)

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

  function onSuccess() {
    log('onSuccess')
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
</div>
