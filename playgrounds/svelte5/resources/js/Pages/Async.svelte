<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script lang="ts">
  import { router, useForm } from '@inertiajs/svelte'
  import TestGrid from '../Components/TestGrid.svelte'
  import TestGridItem from '../Components/TestGridItem.svelte'

  let { appName, jonathan, taylor, joe }: { appName: string; jonathan: boolean; taylor: boolean; joe: boolean } =
    $props()

  let reloadCount = $state(0)
  const form = useForm({ jonathan, taylor, joe })

  $effect(() => {
    console.log('watched reload count value', reloadCount)
  })

  function submit() {
    router.post(
      '/async/checkbox',
      {
        jonathan: form.jonathan,
        taylor: form.taylor,
        joe: form.joe,
      },
      {
        async: true,
      },
    )
  }

  function simulateConflict() {
    router.reload({
      only: ['sleep'],
    })
    router.visit('/sleepy/2')
  }

  function triggerVisitThenReload() {
    router.visit('/sleepy/1')
    router.reload({
      only: ['sleep'],
    })
  }

  function triggerLongReload() {
    router.reload({
      only: ['sleep'],
      onFinish() {
        console.log('finished reload')
        reloadCount++
        console.log('incremented reload count')
      },
    })
  }

  function triggerCancel() {
    router.post(
      '/sleepy/3',
      {},
      {
        onCancelToken: (token) => {
          console.log('onCancelToken')

          setTimeout(() => {
            console.log('CANCELLING!')
            token.cancel()
          }, 1000)
        },
      },
    )
  }

  function triggerCancelAfterFinish() {
    let cancelToken

    router.post(
      '/sleepy/1',
      {},
      {
        onCancelToken: (token) => {
          console.log('onCancelToken')

          cancelToken = token
        },
        onFinish: () => {
          console.log('onFinish')
          console.log('CANCELLING!')
          cancelToken.cancel()
        },
      },
    )
  }
</script>

<svelte:head>
  <title>Async Request - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Async Request</h1>
<p class="mt-6">Reload Count: {reloadCount}</p>

<TestGrid>
  <TestGridItem class="space-y-4">
    <p>Trigger an async reload that takes a moment and immediately programmatically visit another page</p>
    <button class="rounded-sm bg-green-600 px-4 py-2 text-white" onclick={simulateConflict}>Reload → Visit</button>
  </TestGridItem>

  <TestGridItem class="space-y-4">
    <form onchange={submit}>
      <label class="block">
        <input bind:checked={form.jonathan} type="checkbox" class="mr-2" />
        Jonathan
      </label>
      <label class="block">
        <input bind:checked={form.taylor} type="checkbox" class="mr-2" />
        Taylor
      </label>
      <label class="block">
        <input bind:checked={form.joe} type="checkbox" class="mr-2" />
        Joe
      </label>
    </form>
    <p>You can check these on and off and then navigate to another page and the requests should still complete.</p>
    <p>Toggling "Joe" on will cause a redirect to "Article", simulating an authorized action e.g.</p>
  </TestGridItem>

  <TestGridItem class="space-y-4">
    <p>Trigger programmatic visit and an async reload one after another</p>

    <p>Reload should still happen but won't re-direct back to the reloaded component, we should respect the visit</p>

    <button onclick={triggerVisitThenReload} class="rounded-sm bg-green-600 px-4 py-2 text-white">Visit → Reload</button
    >
  </TestGridItem>

  <TestGridItem class="space-y-4">
    <p>Simply trigger a 4 second reload so you can navigate or do whatever you'd like during it.</p>
    <button onclick={triggerLongReload} class="rounded-sm bg-green-600 px-4 py-2 text-white">Trigger Long Reload</button
    >
  </TestGridItem>

  <TestGridItem class="space-y-4">
    <p>Trigger an automatic cancellation from the token.</p>
    <button onclick={triggerCancel} class="rounded-sm bg-green-600 px-4 py-2 text-white">Trigger Cancel</button>
  </TestGridItem>

  <TestGridItem class="space-y-4">
    <p>Trigger an automatic cancellation from the token after finishing request.</p>
    <button onclick={triggerCancelAfterFinish} class="rounded-sm bg-green-600 px-4 py-2 text-white">
      Trigger Cancel After Finish
    </button>
  </TestGridItem>
</TestGrid>
