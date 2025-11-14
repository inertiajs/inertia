import { Page } from '@inertiajs/core'
import { router } from '@inertiajs/react'
import { useState } from 'react'

interface PageProps {
  foo: string
  bar: string
}

export default ({ foo, bar }: PageProps) => {
  const [errors, setErrors] = useState(0)
  const [finished, setFinished] = useState(0)
  const [success, setSuccess] = useState(0)
  const [random] = useState(Math.random())

  const bagErrors = () => {
    router.replace({
      preserveState: true,
      props: (props: Page['props']) => ({ ...props, errors: { bag: { foo: 'bar' } } }),
      errorBag: 'bag',
      onError: (err) => {
        setErrors(Object.keys(err).length)
      },
      onFinish: () => setFinished(finished + 1),
      onSuccess: () => setSuccess(success + 1),
    })
  }

  const defaultErrors = () => {
    router.replace({
      preserveState: true,
      props: (props: PageProps) => ({ ...props, errors: { foo: 'bar', baz: 'qux' } }),
      onError: (err) => {
        setErrors(Object.keys(err).length)
      },
      onFinish: () => setFinished(finished + 1),
      onSuccess: () => setSuccess(success + 1),
    })
  }

  const replace = () => {
    router.replace({
      preserveState: true,
      props: (props) => ({ ...props, foo: 'foo from client' }),
      onFinish: () => setFinished(finished + 1),
      onSuccess: () => setSuccess(success + 1),
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

  return (
    <div>
      <div>{foo}</div>
      <div>{bar}</div>
      <button onClick={replace}>Replace</button>
      <button onClick={() => replaceAndPreserveStateWithErrors({ name: 'Field is required' })}>
        Replace with errors
      </button>
      <button onClick={() => replaceAndPreserveStateWithErrors()}>Replace without errors</button>
      <button onClick={push}>Push</button>
      <button onClick={defaultErrors}>Errors (default)</button>
      <button onClick={bagErrors}>Errors (bag)</button>
      <div>Errors: {errors}</div>
      <div>Finished: {finished}</div>
      <div>Success: {success}</div>
      <div id="random">Random: {random}</div>
    </div>
  )
}
