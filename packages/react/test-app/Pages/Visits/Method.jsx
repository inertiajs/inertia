import { router } from '@inertiajs/react'

export default (props) => {
  const standardVisitMethod = () => {
    router.visit('/dump/get')
  }

  const specificVisitMethod = () => {
    router.visit('/dump/patch', { method: 'patch' })
  }

  const getMethod = () => {
    router.get('/dump/get')
  }

  const postMethod = () => {
    router.post('/dump/post')
  }

  const putMethod = () => {
    router.put('/dump/put')
  }

  const patchMethod = () => {
    router.patch('/dump/patch')
  }

  const deleteMethod = () => {
    router.delete('/dump/delete')
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates manual visit methods</span>

      <span onClick={standardVisitMethod} className="visit-get">
        Standard visit Link
      </span>
      <span onClick={specificVisitMethod} className="visit-specific">
        Specific visit Link
      </span>
      <span onClick={getMethod} className="get">
        GET Link
      </span>
      <span onClick={postMethod} className="post">
        POST Link
      </span>
      <span onClick={putMethod} className="put">
        PUT Link
      </span>
      <span onClick={patchMethod} className="patch">
        PATCH Link
      </span>
      <span onClick={deleteMethod} className="delete">
        DELETE Link
      </span>
    </div>
  )
}
