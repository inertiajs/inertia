import { router } from '@inertiajs/react'

export default (props) => {
  const defaultVisit = () => {
    router.post('/dump/post')
  }

  const basicVisit = () => {
    router.visit('/dump/post', { method: 'post', data: { foo: 'bar' }, errorBag: 'visitErrorBag' })
  }

  const postVisit = () => {
    router.post('/dump/post', { foo: 'baz' }, { errorBag: 'postErrorBag' })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates error bags using manual visits</span>
      <span onClick={defaultVisit} className="default">
        Default visit
      </span>
      <span onClick={basicVisit} className="visit">
        Basic visit
      </span>
      <span onClick={postVisit} className="get">
        POST visit
      </span>
    </div>
  )
}
