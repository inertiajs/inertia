import { router } from '@inertiajs/react'

export default (props) => {
  const standardVisitMethod = (e) => {
    e.preventDefault()
    router.visit('/dump/get')
  }

  const specificVisitMethod = (e) => {
    e.preventDefault()
    router.visit('/dump/patch', { method: 'patch' })
  }

  const getMethod = (e) => {
    e.preventDefault()
    router.get('/dump/get')
  }

  const postMethod = (e) => {
    e.preventDefault()
    router.post('/dump/post')
  }

  const putMethod = (e) => {
    e.preventDefault()
    router.put('/dump/put')
  }

  const patchMethod = (e) => {
    e.preventDefault()
    router.patch('/dump/patch')
  }

  const deleteMethod = (e) => {
    e.preventDefault()
    router.delete('/dump/delete')
  }

  const wayfinderObjectVisit = (e) => {
    e.preventDefault()
    router.visit({ url: '/dump/post', method: 'post' })
  }

  const wayfinderObjectMethodOverride = (e) => {
    e.preventDefault()
    router.visit({ url: '/dump/patch', method: 'get' }, { method: 'patch' })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates manual visit methods</span>

      <a href="#" onClick={standardVisitMethod} className="visit-get">
        Standard visit Link
      </a>
      <a href="#" onClick={specificVisitMethod} className="visit-specific">
        Specific visit Link
      </a>
      <a href="#" onClick={getMethod} className="get">
        GET Link
      </a>
      <a href="#" onClick={postMethod} className="post">
        POST Link
      </a>
      <a href="#" onClick={putMethod} className="put">
        PUT Link
      </a>
      <a href="#" onClick={patchMethod} className="patch">
        PATCH Link
      </a>
      <a href="#" onClick={deleteMethod} className="delete">
        DELETE Link
      </a>
      <a href="#" onClick={wayfinderObjectVisit} className="wayfinder-visit">
        Wayfinder object visit
      </a>
      <a href="#" onClick={wayfinderObjectMethodOverride} className="wayfinder-method-override">
        Wayfinder object method override
      </a>
    </div>
  )
}
