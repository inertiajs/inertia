import { router } from '@inertiajs/react'

export default (props) => {
  const replace = () => {
    router.visit('/dump/get', { replace: true })
  }

  const replaceFalse = () => {
    router.visit('/dump/get', { replace: false })
  }

  const replaceGet = () => {
    router.get('/dump/get', {}, { replace: true })
  }

  const replaceGetFalse = () => {
    router.get('/dump/get', {}, { replace: false })
  }

  return (
    <div>
      <span className="text">This is the links page that demonstrates manual replace</span>

      <span onClick={replace} className="replace">
        [State] Replace visit: true
      </span>
      <span onClick={replaceFalse} className="replace-false">
        [State] Replace visit: false
      </span>
      <span onClick={replaceGet} className="replace-get">
        [State] Replace GET: true
      </span>
      <span onClick={replaceGetFalse} className="replace-get-false">
        [State] Replace GET: false
      </span>
    </div>
  )
}
