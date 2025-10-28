<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'

  const transitionWithBoolean = () => {
    router.visit('/view-transition/page-b', {
      viewTransition: true,
    })
  }

  const transitionWithCallback = () => {
    router.visit('/view-transition/page-b', {
      viewTransition: (viewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      },
    })
  }
</script>

<h1>Page A - View Transition Test</h1>

<button on:click={transitionWithBoolean}>Transition with boolean</button>
<button on:click={transitionWithCallback}>Transition with callback</button>
<a
  href="/view-transition/page-b"
  use:inertia={{
    viewTransition: (viewTransition) => {
      viewTransition.ready.then(() => console.log('ready'))
      viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
      viewTransition.finished.then(() => console.log('finished'))
    },
  }}>Link to Page B</a
>
