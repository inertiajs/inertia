import { router } from '@inertiajs/react'

export default () => {
  const visitDump = (e) => {
    e.preventDefault()
    router.visit('/dump/get')
  }

  const throwErrorOnSuccess = (e) => {
    e.preventDefault()

    router.visit('/visits/after-error/2', {
      onSuccess: () => {
        throw new Error('Error after visit')
      }
    })
  }

  return (
    <div>
      <a href="#" onClick={visitDump}>
        Visit dump page
      </a>

      <a href="#" onClick={throwErrorOnSuccess}>
        Throw error on success
      </a>
    </div>
  )
}
