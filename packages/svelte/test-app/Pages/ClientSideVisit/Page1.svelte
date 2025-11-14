<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import type { Page } from '@inertiajs/core'

  interface PageProps {
    foo: string
    bar: string
  }

  export let foo: string
  export let bar: string

  let errors = 0
  let finished = 0
  let success = 0
  let random = Math.random()

  const bagErrors = () => {
    router.replace({
      preserveState: true,
      props: (props: Page['props']) => ({ ...props, errors: { bag: { foo: 'bar' } } }),
      errorBag: 'bag',
      onError: (err) => {
        errors = Object.keys(err).length
      },
      onFinish: () => finished++,
      onSuccess: () => success++,
    })
  }

  const defaultErrors = () => {
    router.replace({
      preserveState: true,
      props: (props: PageProps) => ({ ...props, errors: { foo: 'bar', baz: 'qux' } }),
      onError: (err) => {
        errors = Object.keys(err).length
      },
      onFinish: () => finished++,
      onSuccess: () => success++,
    })
  }

  const replace = () => {
    router.replace({
      preserveState: true,
      props: (props) => ({ ...props, foo: 'foo from client' }),
      onFinish: () => finished++,
      onSuccess: () => success++,
    })
  }

  const replaceAndPreserveStateWithErrors = (errors = {}) => {
    router.replace({
      preserveState: 'errors',
      props: (props: PageProps) => ({ ...props, errors }),
    })
  }

  const push = () => {
    router.push({
      url: '/client-side-visit-2',
      component: 'ClientSideVisit/Page2',
      props: { baz: 'baz from client' },
    })
  }
</script>

<div>
  <div>{foo}</div>
  <div>{bar}</div>
  <button on:click={replace}>Replace</button>
  <button on:click={() => replaceAndPreserveStateWithErrors({ name: 'Field is required' })}>
    Replace with errors
  </button>
  <button on:click={() => replaceAndPreserveStateWithErrors()}>Replace without errors</button>
  <button on:click={push}>Push</button>
  <button on:click={defaultErrors}>Errors (default)</button>
  <button on:click={bagErrors}>Errors (bag)</button>
  <div>Errors: {errors}</div>
  <div>Finished: {finished}</div>
  <div>Success: {success}</div>
  <div id="random">Random: {random}</div>
</div>
