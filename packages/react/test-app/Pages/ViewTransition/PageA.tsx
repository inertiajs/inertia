import { Link, router } from '@inertiajs/react'

export default () => {
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

  return (
    <div>
      <h1>Page A - View Transition Test</h1>

      <button onClick={transitionWithBoolean}>Transition with boolean</button>
      <button onClick={transitionWithCallback}>Transition with callback</button>
      <button onClick={clientSideReplace}>Client-side replace</button>
      <Link
        href="/view-transition/page-b"
        viewTransition={(viewTransition) => {
          viewTransition.ready.then(() => console.log('ready'))
          viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
          viewTransition.finished.then(() => console.log('finished'))
        }}
      >
        Link to Page B
      </Link>
    </div>
  )
}
