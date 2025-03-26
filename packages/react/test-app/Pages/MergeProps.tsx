import { router } from '@inertiajs/react'

export default ({ bar, foo }) => {
  const reloadIt = () => {
    router.reload({
      only: ['foo'],
    })
  }

  const getFresh = () => {
    router.reload({
      reset: ['foo'],
    })
  }

  return (
    <>
      <div>bar count is {bar.length}</div>
      <div>foo count is {foo.length}</div>
      <button onClick={reloadIt}>Reload</button>
      <button onClick={getFresh}>Get Fresh</button>
    </>
  )
}
