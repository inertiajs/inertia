<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

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

  const supersedeTransition = () => {
    router.visit('/view-transition/page-b', {
      viewTransition: () => {
        // Simulate a rapid second navigation that aborts this in-flight transition.
        document.startViewTransition(() => {})
      },
    })
  }

  const clientSideReplace = () => {
    router.replace({
      url: '/view-transition/page-b',
      component: 'ViewTransition/PageB',
      props: {},
      viewTransition: (viewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      },
    })
  }
</script>

<h1>Page A - View Transition Test</h1>

<button onclick={transitionWithBoolean}>Transition with boolean</button>
<button onclick={transitionWithCallback}>Transition with callback</button>
<button onclick={clientSideReplace}>Client-side replace</button>
<button onclick={supersedeTransition}>Supersede transition</button>
<Link
  href="/view-transition/page-b"
  viewTransition={(viewTransition) => {
    viewTransition.ready.then(() => console.log('ready'))
    viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
    viewTransition.finished.then(() => console.log('finished'))
  }}>Link to Page B</Link
>
