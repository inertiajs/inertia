import { router } from '@inertiajs/react'

export default (props) => {
  const defaultVisit = (e) => {
    e.preventDefault()
    router.post('/dump/post')
  }

  const basicVisit = (e) => {
    e.preventDefault()
    router.visit('/dump/post', { method: 'post', data: { foo: 'bar' }, errorBag: 'visitErrorBag' })
  }

  const postVisit = (e) => {
    e.preventDefault()
    router.post('/dump/post', { foo: 'baz' }, { errorBag: 'postErrorBag' })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates error bags using manual visits</span>
      <a href="#" onClick={defaultVisit} className="default">
        Default visit
      </a>
      <a href="#" onClick={basicVisit} className="visit">
        Basic visit
      </a>
      <a href="#" onClick={postVisit} className="get">
        POST visit
      </a>
    </div>
  )
}
