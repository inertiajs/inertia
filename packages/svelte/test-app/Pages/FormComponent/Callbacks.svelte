<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let events = $state<string[]>([])
  let cancelErrors = $state(true)

  function log(event: string) {
    events = [...events, event]
  }
</script>

<Form
  action="/form-component/callbacks"
  method="post"
  onBeforeUpdate={(page) => log(`onBeforeUpdate:${page.component}`)}
  onHttpException={(response) => {
    log(`onHttpException:${response.status}`)
    return cancelErrors ? false : undefined
  }}
  onNetworkError={(error) => {
    log(`onNetworkError:${error instanceof Error}`)
    return cancelErrors ? false : undefined
  }}
  onFlash={(flash) => log(`onFlash:${JSON.stringify(flash)}`)}
  onSuccess={() => log('onSuccess')}
  onError={() => log('onError')}
  onFinish={() => log('onFinish')}
>
  {#snippet children({ processing })}
    <label><input type="checkbox" bind:checked={cancelErrors} /> Cancel errors</label>
    <pre id="events">{events.join('\n')}</pre>
    <span id="processing">{String(processing)}</span>
    <button type="submit">Submit</button>
  {/snippet}
</Form>
